pipeline {
    agent any
    
    environment {
        // AWS Configuration
        AWS_REGION = 'ap-southeast-2'
        AWS_ACCOUNT_ID = '675613596870'
        ECR_REPOSITORY_NEXTJS = 'meo-stationery'
        ECR_REPOSITORY_FLASK = 'meo-stationery-flask'
        
        // Docker Configuration
        DOCKER_BUILDKIT = '1'
        
        // Application Configuration
        NODE_VERSION = '18'
        PYTHON_VERSION = '3.11'
        
        // Deployment Configuration
        EC2_HOST = '3.27.135.113'
        EC2_USER = 'ubuntu'
    }
    
    tools {
        nodejs "${NODE_VERSION}"
        // Add Python tool if available in Jenkins
    }
    
    stages {
        stage('🔍 Checkout & Environment') {
            steps {
                script {
                    echo "🚀 Starting Meo Stationery CI/CD Pipeline"
                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    echo "Workspace: ${env.WORKSPACE}"
                    
                    // Clean workspace
                    cleanWs()
                    
                    // Checkout code
                    checkout scm
                    
                    // Display environment info
                    sh '''
                        echo "=== Environment Information ==="
                        node --version
                        npm --version
                        python3 --version
                        docker --version
                        aws --version
                        echo "==============================="
                    '''
                }
            }
        }
        
        stage('📦 Install Dependencies') {
            parallel {
                stage('Next.js Dependencies') {
                    steps {
                        script {
                            echo "📦 Installing Next.js dependencies..."
                            sh '''
                                npm ci
                                echo "✅ Next.js dependencies installed"
                            '''
                        }
                    }
                }
                
                stage('Flask Dependencies') {
                    steps {
                        script {
                            echo "🐍 Installing Flask dependencies..."
                            sh '''
                                cd flask_app
                                python3 -m pip install --user -r requirements.txt
                                echo "✅ Flask dependencies installed"
                            '''
                        }
                    }
                }
                
                stage('Monitoring Dependencies') {
                    steps {
                        script {
                            echo "📊 Installing monitoring dependencies..."
                            sh '''
                                cd monitoring
                                python3 -m pip install --user -r requirements.txt
                                echo "✅ Monitoring dependencies installed"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('🧪 Testing & Quality Checks') {
            parallel {
                stage('Next.js Tests') {
                    steps {
                        script {
                            echo "🧪 Running Next.js tests..."
                            sh '''
                                # Lint check
                                npm run lint
                                
                                # Type check
                                npx tsc --noEmit
                                
                                # Build test
                                npm run build
                                
                                echo "✅ Next.js tests passed"
                            '''
                        }
                    }
                    post {
                        always {
                            // Archive build artifacts
                            archiveArtifacts artifacts: '.next/**/*', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Flask Tests') {
                    steps {
                        script {
                            echo "🐍 Running Flask tests..."
                            sh '''
                                cd flask_app
                                
                                # Syntax check
                                python3 -m py_compile app.py
                                
                                # Simple import test
                                python3 -c "import app; print('Flask app imports successfully')"
                                
                                echo "✅ Flask tests passed"
                            '''
                        }
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        script {
                            echo "🔒 Running security scans..."
                            sh '''
                                # NPM audit
                                npm audit --audit-level moderate || true
                                
                                # Python safety check (if available)
                                python3 -m pip install --user safety || true
                                python3 -m safety check || true
                                
                                echo "✅ Security scan completed"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('🐳 Build Docker Images') {
            when {
                anyOf {
                    branch 'master'
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('Build Next.js Image') {
                    steps {
                        script {
                            echo "🐳 Building Next.js Docker image..."
                            sh '''
                                # Build Next.js image
                                docker build -t meo-stationery:${BUILD_NUMBER} .
                                docker tag meo-stationery:${BUILD_NUMBER} meo-stationery:latest
                                
                                # Tag for ECR
                                docker tag meo-stationery:${BUILD_NUMBER} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NEXTJS}:${BUILD_NUMBER}
                                docker tag meo-stationery:${BUILD_NUMBER} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NEXTJS}:latest
                                
                                echo "✅ Next.js Docker image built"
                            '''
                        }
                    }
                }
                
                stage('Build Flask Image') {
                    steps {
                        script {
                            echo "🐍 Building Flask Docker image..."
                            sh '''
                                cd flask_app
                                
                                # Build Flask image
                                docker build -t meo-stationery-flask:${BUILD_NUMBER} .
                                docker tag meo-stationery-flask:${BUILD_NUMBER} meo-stationery-flask:latest
                                
                                # Tag for ECR
                                docker tag meo-stationery-flask:${BUILD_NUMBER} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_FLASK}:${BUILD_NUMBER}
                                docker tag meo-stationery-flask:${BUILD_NUMBER} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_FLASK}:latest
                                
                                echo "✅ Flask Docker image built"
                            '''
                        }
                    }
                }
                
                stage('Build Monitoring Image') {
                    steps {
                        script {
                            echo "📊 Building Monitoring Docker image..."
                            sh '''
                                cd monitoring
                                
                                # Build monitoring image
                                docker build -t meo-monitoring:${BUILD_NUMBER} .
                                docker tag meo-monitoring:${BUILD_NUMBER} meo-monitoring:latest
                                
                                echo "✅ Monitoring Docker image built"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('📤 Push to ECR') {
            when {
                anyOf {
                    branch 'master'
                    branch 'main'
                }
            }
            steps {
                script {
                    echo "📤 Pushing images to ECR..."
                    withAWS(region: "${AWS_REGION}") {
                        sh '''
                            # Login to ECR
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                            
                            # Create repositories if they don't exist
                            aws ecr describe-repositories --repository-names ${ECR_REPOSITORY_NEXTJS} --region ${AWS_REGION} || aws ecr create-repository --repository-name ${ECR_REPOSITORY_NEXTJS} --region ${AWS_REGION}
                            aws ecr describe-repositories --repository-names ${ECR_REPOSITORY_FLASK} --region ${AWS_REGION} || aws ecr create-repository --repository-name ${ECR_REPOSITORY_FLASK} --region ${AWS_REGION}
                            
                            # Push Next.js image
                            docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NEXTJS}:${BUILD_NUMBER}
                            docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NEXTJS}:latest
                            
                            # Push Flask image
                            docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_FLASK}:${BUILD_NUMBER}
                            docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_FLASK}:latest
                            
                            echo "✅ Images pushed to ECR successfully"
                        '''
                    }
                }
            }
        }
        
        stage('🚀 Deploy to Production') {
            when {
                branch 'master'
            }
            steps {
                script {
                    echo "🚀 Deploying to production EC2..."
                    
                    // Deploy using SSH
                    sshagent(['ec2-ssh-key']) {
                        sh '''
                            # Create deployment script
                            cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment on EC2..."

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Pull latest images
docker pull ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NEXTJS}:latest
docker pull ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_FLASK}:latest

# Stop existing containers
docker-compose down || true

# Update docker-compose to use ECR images
sed -i 's|image: meo-stationery:latest|image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NEXTJS}:latest|g' docker-compose.yml

# Start updated containers
docker-compose up -d

# Health check
sleep 30
curl -f http://localhost:3000/api/health || exit 1
curl -f http://localhost:5000/api/health || exit 1

echo "✅ Deployment completed successfully!"
EOF

                            # Copy and execute deployment script
                            scp -o StrictHostKeyChecking=no deploy.sh ${EC2_USER}@${EC2_HOST}:/tmp/
                            ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
                            
                            echo "✅ Production deployment completed"
                        '''
                    }
                }
            }
        }
        
        stage('🔍 Post-Deploy Tests') {
            when {
                branch 'master'
            }
            steps {
                script {
                    echo "🔍 Running post-deployment tests..."
                    sh '''
                        # Health checks
                        echo "Testing Next.js application..."
                        curl -f http://${EC2_HOST}:3000/api/health
                        
                        echo "Testing Flask API..."
                        curl -f http://${EC2_HOST}:5000/api/health
                        
                        echo "Testing main application..."
                        curl -f http://${EC2_HOST}:3000/ | grep -i "meo" || exit 1
                        
                        echo "✅ All post-deployment tests passed"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Cleaning up..."
                
                // Clean up Docker images to save space
                sh '''
                    # Remove dangling images
                    docker image prune -f || true
                    
                    # Remove old build images (keep last 3)
                    docker images meo-stationery --format "table {{.Repository}}:{{.Tag}}" | tail -n +4 | xargs -r docker rmi || true
                '''
                
                // Archive important artifacts
                archiveArtifacts artifacts: '**/*.log', allowEmptyArchive: true
                
                echo "📊 Pipeline completed - Build #${env.BUILD_NUMBER}"
            }
        }
        
        success {
            script {
                echo "✅ Pipeline completed successfully!"
                
                // Send success notification (if configured)
                // slackSend(channel: '#deployments', color: 'good', message: "✅ Meo Stationery deployed successfully - Build #${env.BUILD_NUMBER}")
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed!"
                
                // Send failure notification (if configured)
                // slackSend(channel: '#deployments', color: 'danger', message: "❌ Meo Stationery deployment failed - Build #${env.BUILD_NUMBER}")
                
                // Collect failure logs
                sh '''
                    echo "=== Docker Logs ==="
                    docker logs $(docker ps -aq) || true
                    echo "==================="
                '''
            }
        }
        
        unstable {
            script {
                echo "⚠️ Pipeline completed with warnings"
            }
        }
    }
}
