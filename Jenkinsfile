pipeline {
    agent {
        label 'windows-indesign'
    }

    environment {
        INDESIGN_PROXY = 'http://localhost:8013'
        EXPORT_PATH = "${WORKSPACE}/exports"
        VALIDATION_THRESHOLD = '85'
    }

    parameters {
        choice(
            name: 'QUALITY_PRESET',
            choices: ['production', 'review', 'draft'],
            description: 'Quality preset for export'
        )
        booleanParam(
            name: 'AUTO_FIX_COLORS',
            defaultValue: true,
            description: 'Automatically fix missing colors'
        )
        string(
            name: 'DOCUMENT_PATH',
            defaultValue: 'documents/TEEI_AWS_Partnership_Brief.indd',
            description: 'Path to InDesign document'
        )
    }

    stages {
        stage('Setup') {
            steps {
                echo 'Setting up environment...'

                // Clean workspace
                deleteDir()
                checkout scm

                // Install Python dependencies
                bat '''
                    python -m venv .venv
                    call .venv\\Scripts\\activate.bat
                    pip install -r requirements.txt
                    pip install -r requirements-extended.txt
                '''

                // Ensure InDesign is running
                bat '''
                    powershell -Command "
                        $indesign = Get-Process -Name InDesign -ErrorAction SilentlyContinue
                        if (-not $indesign) {
                            Write-Host 'Starting InDesign...'
                            Start-Process 'C:\\Program Files\\Adobe\\Adobe InDesign 2024\\InDesign.exe'
                            Start-Sleep -Seconds 10
                        } else {
                            Write-Host 'InDesign is already running'
                        }
                    "
                '''
            }
        }

        stage('Validate Colors') {
            steps {
                script {
                    def result = bat(
                        script: '''
                            call .venv\\Scripts\\activate.bat
                            python -c "
from pipeline import InDesignPipeline
p = InDesignPipeline()
p.connect_to_indesign()
valid, missing = p.validate_colors()
print(f'Colors Valid: {valid}')
print(f'Missing: {missing}')
exit(0 if valid else 1)
                            "
                        ''',
                        returnStatus: true
                    )

                    if (result != 0 && params.AUTO_FIX_COLORS) {
                        echo 'Fixing missing colors...'
                        bat '''
                            call .venv\\Scripts\\activate.bat
                            python -c "
from pipeline import InDesignPipeline
p = InDesignPipeline()
p.connect_to_indesign()
p.fix_missing_colors([])
                            "
                        '''
                    }
                }
            }
        }

        stage('Export Document') {
            steps {
                bat """
                    call .venv\\Scripts\\activate.bat
                    python pipeline.py ^
                        --config pipeline.config.json ^
                        --ci ^
                        --threshold ${VALIDATION_THRESHOLD} ^
                        --export-formats pdf png
                """
            }
        }

        stage('Quality Check') {
            steps {
                script {
                    // Find the latest PDF
                    def pdfs = findFiles(glob: 'exports/*.pdf')
                    if (pdfs.length > 0) {
                        def pdfPath = pdfs[0].path

                        // Run validation
                        def validationResult = bat(
                            script: """
                                call .venv\\Scripts\\activate.bat
                                python validate_document.py "${pdfPath}" --json
                            """,
                            returnStdout: true
                        ).trim()

                        // Parse JSON result
                        def validation = readJSON text: validationResult
                        def score = validation.score ?: 0

                        // Set build description
                        currentBuild.description = "Score: ${score}/100"

                        // Fail if below threshold
                        if (score < params.VALIDATION_THRESHOLD.toInteger()) {
                            error("Validation failed: Score ${score} below threshold ${params.VALIDATION_THRESHOLD}")
                        }
                    }
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'exports/**/*', fingerprint: true
                archiveArtifacts artifacts: 'pipeline_report_*.txt', allowEmptyArchive: true
                archiveArtifacts artifacts: 'pipeline_report_*.json', allowEmptyArchive: true
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'main'
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                script {
                    // Deploy to S3
                    withAWS(credentials: 'aws-teei-credentials', region: 'us-east-1') {
                        s3Upload(
                            bucket: 'teei-documents-staging',
                            path: 'latest/',
                            includePathPattern: 'exports/**/*',
                            excludePathPattern: '**/*.tmp',
                            metadatas: [
                                'build-number': "${env.BUILD_NUMBER}",
                                'git-commit': "${env.GIT_COMMIT}",
                                'quality-preset': "${params.QUALITY_PRESET}"
                            ]
                        )
                    }

                    // Invalidate CloudFront
                    withAWS(credentials: 'aws-teei-credentials', region: 'us-east-1') {
                        cfInvalidate(
                            distribution: env.CLOUDFRONT_DISTRIBUTION_ID,
                            paths: ['/*']
                        )
                    }
                }
            }
        }
    }

    post {
        always {
            // Generate HTML report
            publishHTML(
                target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'exports',
                    reportFiles: '*.pdf',
                    reportName: 'Exported Documents'
                ]
            )
        }

        success {
            script {
                // Send success notification
                if (env.SLACK_WEBHOOK) {
                    def message = [
                        text: "InDesign Pipeline Success",
                        attachments: [[
                            color: "good",
                            title: "Build #${env.BUILD_NUMBER}",
                            text: "Document validated and exported successfully",
                            fields: [
                                [title: "Score", value: currentBuild.description, short: true],
                                [title: "Preset", value: params.QUALITY_PRESET, short: true]
                            ]
                        ]]
                    ]
                    httpRequest(
                        url: env.SLACK_WEBHOOK,
                        httpMode: 'POST',
                        contentType: 'APPLICATION_JSON',
                        requestBody: groovy.json.JsonOutput.toJson(message)
                    )
                }
            }
        }

        failure {
            script {
                // Send failure notification
                if (env.SLACK_WEBHOOK) {
                    def message = [
                        text: "InDesign Pipeline Failed",
                        attachments: [[
                            color: "danger",
                            title: "Build #${env.BUILD_NUMBER}",
                            text: "Document validation or export failed",
                            fields: [
                                [title: "Document", value: params.DOCUMENT_PATH, short: false]
                            ]
                        ]]
                    ]
                    httpRequest(
                        url: env.SLACK_WEBHOOK,
                        httpMode: 'POST',
                        contentType: 'APPLICATION_JSON',
                        requestBody: groovy.json.JsonOutput.toJson(message)
                    )
                }
            }
        }

        cleanup {
            // Clean up temporary files
            bat '''
                if exist .venv rmdir /s /q .venv
                if exist exports\\*.tmp del /q exports\\*.tmp
            '''
        }
    }
}