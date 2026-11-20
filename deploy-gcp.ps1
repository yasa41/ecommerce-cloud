# ==============================================================================
# NEXORA – 1-Click Google Cloud Run Deployment Script (Windows PowerShell)
# ==============================================================================

$ServiceName = "nexora"
$Region = "us-central1"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "          NEXORA Google Cloud Run Deployment Script             " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: 'gcloud' CLI is not found on your system." -ForegroundColor Red
    Write-Host "RECOMMENDED: Use Google Cloud Shell (free in your browser at https://shell.cloud.google.com)" -ForegroundColor Yellow
    Write-Host "Or install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Exit 1
}

$ProjectId = (gcloud config get-value project 2>$null).Trim()

if ([string]::IsNullOrWhiteSpace($ProjectId) -or $ProjectId -eq "(unset)") {
    $ProjectId = Read-Host "Enter your Google Cloud Project ID"
    gcloud config set project $ProjectId
}

Write-Host "Deploying NEXORA to Project: $ProjectId in Region: $Region..." -ForegroundColor Green

# 1. Enable Cloud Run and Cloud Build APIs
Write-Host ">>> Enabling Cloud Run and Cloud Build APIs..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 2. Deploy to Cloud Run
Write-Host ">>> Building and deploying container to Google Cloud Run..." -ForegroundColor Cyan
gcloud run deploy $ServiceName `
    --source . `
    --region $Region `
    --port 8080 `
    --allow-unauthenticated `
    --min-instances 1 `
    --max-instances 4 `
    --cpu 1 `
    --memory 512Mi `
    --set-env-vars NODE_ENV=production,GCP_REGION=$Region,GOOGLE_CLOUD_PROJECT=$ProjectId

$ServiceUrl = (gcloud run services describe $ServiceName --region $Region --format 'value(status.url)').Trim()

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "       NEXORA DEPLOYMENT SUCCESSFUL TO GOOGLE CLOUD!            " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "Your Live E-Commerce Store & Cloud Center URL:" -ForegroundColor Yellow
Write-Host "👉 $ServiceUrl" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Green
