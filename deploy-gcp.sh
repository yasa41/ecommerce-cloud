#!/usr/bin/env bash
# ==============================================================================
# NEXORA – 1-Click Google Cloud Run Deployment Script (Cloud Shell / Linux / Mac)
# ==============================================================================

set -e

SERVICE_NAME="nexora"
REGION="us-central1"

echo "================================================================"
echo "          NEXORA Google Cloud Run Deployment Script             "
echo "================================================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "ERROR: 'gcloud' CLI is not found."
    echo "Please run this script inside Google Cloud Shell (https://shell.cloud.google.com)"
    echo "or install the Google Cloud SDK locally."
    exit 1
fi

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
    echo "No Google Cloud project is currently selected."
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo "Deploying NEXORA to Project: $PROJECT_ID in Region: $REGION..."

# 1. Enable required Google Cloud services
echo ">>> Enabling Cloud Run and Cloud Build APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 2. Build container and deploy to Google Cloud Run
echo ">>> Building and deploying container to Google Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --region "$REGION" \
    --port 8080 \
    --allow-unauthenticated \
    --min-instances 1 \
    --max-instances 4 \
    --cpu 1 \
    --memory 512Mi \
    --set-env-vars NODE_ENV=production,GCP_REGION=$REGION,GOOGLE_CLOUD_PROJECT=$PROJECT_ID

echo ""
echo "================================================================"
echo "           NEXORA DEPLOYMENT SUCCESSFUL TO GOOGLE CLOUD!        "
echo "================================================================"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')
echo "Your Live E-Commerce Store & Cloud Center URL:"
echo "👉 $SERVICE_URL"
echo "================================================================"
