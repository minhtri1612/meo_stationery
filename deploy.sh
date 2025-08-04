#!/bin/bash

echo "🚀 Meo Stationery AWS EC2 Deployment Script"
echo "==========================================="

# Configuration
EC2_HOST="3.27.135.113"
SSH_KEY="~/.ssh/meo-stationery-key.pem"
REMOTE_DIR="~/meo_stationery"

# Fix key permissions
chmod 400 ~/.ssh/meo-stationery-key.pem

echo "📡 Testing connection to EC2..."
if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i $SSH_KEY ubuntu@$EC2_HOST "echo 'Connected successfully'"; then
    echo "✅ Connection successful!"
    
    echo "📦 Uploading project files..."
    rsync -avz --progress \
        --exclude='node_modules/' \
        --exclude='.next/' \
        --exclude='.git/' \
        --exclude='*.log' \
        --exclude='myappweb.pem' \
        -e "ssh -i $SSH_KEY" \
        . ubuntu@$EC2_HOST:$REMOTE_DIR/
    
    echo "🐳 Setting up Docker on EC2..."
    ssh -i $SSH_KEY ubuntu@$EC2_HOST << 'EOF'
        # Update system
        sudo apt update -y
        
        # Install Docker
        sudo apt install docker.io -y
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Install Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        # Add user to docker group
        sudo usermod -aG docker ubuntu
        
        echo "✅ Docker setup complete!"
EOF
    
    echo "🔧 Updating configuration for production..."
    ssh -i $SSH_KEY ubuntu@$EC2_HOST << EOF
        cd ~/meo_stationery
        
        # Update NEXTAUTH_URL in docker-compose.yml
        sed -i 's|NEXTAUTH_URL=http://localhost:3000|NEXTAUTH_URL=http://$EC2_HOST:3000|g' docker-compose.yml
        
        echo "✅ Configuration updated!"
EOF
    
    echo "🚀 Starting application..."
    ssh -i $SSH_KEY ubuntu@$EC2_HOST << 'EOF'
        cd ~/meo_stationery
        
        # Start services
        docker-compose up -d
        
        # Show status
        echo "📊 Application Status:"
        docker-compose ps
        
        echo ""
        echo "🎉 Deployment Complete!"
        echo "================================"
        echo "Main App: http://$EC2_HOST:3000"
        echo "Monitor:  http://$EC2_HOST:5000"
        echo "================================"
EOF
    
else
    echo "❌ Cannot connect to EC2. Please check:"
    echo "1. EC2 instance is running"
    echo "2. Security group allows SSH (port 22) from your IP"
    echo "3. Public IP address is correct"
    echo ""
    echo "💡 Quick fixes:"
    echo "- Go to AWS Console → EC2 → Security Groups"
    echo "- Add rule: SSH (22) from My IP"
    echo "- Make sure instance is running"
fi
