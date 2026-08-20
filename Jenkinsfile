pipeline {
  agent any

  environment {
    IMAGE = "192.168.56.10:8082/modelfit"
  }

  stages {
    stage('Checkout') {
      steps {
        git url: 'https://github.com/saladinR/modelfit.git', branch: 'main'
      }
    }

    stage('Install deps') {
      steps {
        sh 'npm install'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube-server') {
          sh 'sonar-scanner'
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh "docker build -t ${IMAGE}:${BUILD_NUMBER} ."
      }
    }

    stage('Trivy Scan') {
      steps {
        sh "trivy image --exit-code 1 --severity CRITICAL ${IMAGE}:${BUILD_NUMBER}"
      }
    }

    stage('Push to Nexus') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-docker', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
          sh "echo $PASS | docker login 192.168.56.10:8082 -u $USER --password-stdin"
          sh "docker push ${IMAGE}:${BUILD_NUMBER}"
        }
      }
    }

    stage('Deploy to Swarm') {
      steps {
        sh """
          export TAG=${BUILD_NUMBER}
          docker -H tcp://192.168.56.11:2375 stack deploy -c app-stack.yml modelfit
        """
      }
    }
  }
}
