pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        OPENAI_API_KEY = credentials('openai-api-key')
        MONGODB_URI = credentials('mongodb-uri')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Environment') {
            steps {
                sh '''
                echo "OPEN_AI_API_KEY=$OPENAI_API_KEY" > .env
                echo "MONGODB_URI=$MONGODB_URI" >> .env
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build || echo "No build script found, skipping build step"'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to Production environment'
                sh 'heroku deploy:api --app QuickScoop-backend'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline execution failed!'
        }
    }
}
