from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flask_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    stock = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('orders', lazy=True))

# Routes
@app.route('/')
def index():
    """Home page showing featured products"""
    products = Product.query.limit(6).all()
    return render_template('index.html', products=products)

@app.route('/api/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Flask Meo Stationery API'
    })

@app.route('/api/products')
def api_products():
    """API endpoint to get all products"""
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'category': p.category,
        'stock': p.stock
    } for p in products])

@app.route('/products')
def products():
    """Products listing page"""
    category = request.args.get('category')
    if category:
        products = Product.query.filter_by(category=category).all()
    else:
        products = Product.query.all()
    
    categories = db.session.query(Product.category).distinct().all()
    categories = [cat[0] for cat in categories]
    
    return render_template('products.html', products=products, categories=categories, selected_category=category)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    """Individual product detail page"""
    product = Product.query.get_or_404(product_id)
    return render_template('product_detail.html', product=product)

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Check if user exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists!')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered!')
            return redirect(url_for('register'))
        
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful!')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Login successful!')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials!')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out!')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    """User dashboard"""
    if 'user_id' not in session:
        flash('Please login first!')
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
    
    return render_template('dashboard.html', user=user, orders=orders)

@app.route('/admin')
def admin():
    """Admin panel"""
    if 'user_id' not in session:
        flash('Please login first!')
        return redirect(url_for('login'))
    
    # Simple admin check
    user = User.query.get(session['user_id'])
    if user.username != 'admin':
        flash('Access denied!')
        return redirect(url_for('index'))
    
    users = User.query.all()
    products = Product.query.all()
    orders = Order.query.all()
    
    stats = {
        'total_users': len(users),
        'total_products': len(products),
        'total_orders': len(orders),
        'total_revenue': sum(order.total_amount for order in orders)
    }
    
    return render_template('admin.html', stats=stats, users=users, products=products, orders=orders)

@app.route('/api/stats')
def api_stats():
    """API endpoint for statistics"""
    users_count = User.query.count()
    products_count = Product.query.count()
    orders_count = Order.query.count()
    
    return jsonify({
        'users': users_count,
        'products': products_count,
        'orders': orders_count,
        'timestamp': datetime.utcnow().isoformat()
    })

# Initialize database and sample data
def init_db():
    """Create database tables and sample data"""
    db.create_all()
    
    # Add sample products if none exist
    if Product.query.count() == 0:
        sample_products = [
            Product(name='Blue Pen', description='High-quality blue ballpoint pen', price=2.50, category='Pens', stock=100),
            Product(name='A4 Notebook', description='Lined notebook with 200 pages', price=8.99, category='Notebooks', stock=50),
            Product(name='Pencil Set', description='Set of 12 drawing pencils', price=15.00, category='Pencils', stock=30),
            Product(name='Ruler 30cm', description='Transparent plastic ruler', price=3.25, category='Tools', stock=75),
            Product(name='Eraser Pack', description='Pack of 5 white erasers', price=4.50, category='Tools', stock=60),
            Product(name='Sticky Notes', description='Colorful sticky note pack', price=6.75, category='Paper', stock=40)
        ]
        
        for product in sample_products:
            db.session.add(product)
        
        # Add admin user
        admin = User(username='admin', email='admin@meo-stationery.com')
        admin.set_password('admin123')
        db.session.add(admin)
        
        db.session.commit()
        print("✅ Sample data created!")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
