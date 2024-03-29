# project setup for github and google cloud build

# create a service account for gcb to use
gcloud iam service-accounts create image-builder --display-name="Docker Image Builder Service Account"

# setup environment
export PROJECT_ID=$(gcloud config get-value project)
export GITHUB_USERNAME=GITHUB_USERNAME
export GITHUB_PASSWORD=GITHUB_PASSWORD
export REGION=$APP_REGION
export SERVICE_ACCOUNT_ID=$APP_BUILD_SA@$PROJECT_ID.iam.gserviceaccount.com
export BUILD_SERVICE_ACCOUNT_ID=image-builder@$PROJECT_ID.iam.gserviceaccount.com
export RUN_SERVICE_NAME=demo
export RUN_SERVICE_ACCOUNT=sa-name@$PROJECT_ID.iam.gserviceaccount.com

# grant access to the service account to push images to artifact repository
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_ID" \
  --role="roles/cloudbuild.builds.editor"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_ID" \
  --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_ID" \
  --role="roles/logging.logWriter"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_ID" \
  --role="roles/artifactregistry.createOnPushWriter"
<!-- gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:projects/$PROJECT_ID/serviceAccounts/$SERVICE_ACCOUNT_ID" \
  --role="roles/cloudbuild.builds.editor" -->

# create role in project for service account to deploy to a cloud run service
gcloud iam roles create CloudRunServiceBuilder \
  --project=$PROJECT_ID \
  --description="Cloud Run Service Builder Role" \
  --title="Cloud Run Service Builder" \
  --permissions=run.services.create,\
run.services.update,\
run.services.get,\
run.operations.get

# grant access for service account to deploy to a cloud run service
gcloud iam service-accounts add-iam-policy-binding \
  $PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --member="serviceAccount:$SERVICE_ACCOUNT_ID" \
  --role="roles/iam.serviceAccountUser"
  
<!-- gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_ID" \
  --role="roles/run.admin" -->
<!-- gcloud iam service-accounts add-iam-policy-binding \
  PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --member="serviceAccount:$SERVICE_ACCOUNT_ID" \
  --role="roles/run.admin" -->

# cloudbuild.yaml - deploy container image from artifact registry to a cloud run service
gcloud run deploy $RUN_SERVICE_NAME \
--no-allow-unauthenticated \
--region=$REGION \
--image=$REGION-docker.pkg.dev/$PROJECT_ID/$_RUN_SERVICE_NAME \
--service-account=$RUN_SERVICE_ACCOUNT \
--description="demo built service" \
--memory=144Mi

# create a connection to github
export CONNECTION_NAME=gcp-poc
gcloud builds connections create github $CONNECTION_NAME \
  --description="GitHub Connection for $PROJECT_ID" \
  --project=$PROJECT_ID \
  --host=github.com \
  --username=$GITHUB_USERNAME \
  --password=$GITHUB_PASSWORD \
  --region=$REGION

# create a build trigger using the github connection (cloudbuild.yaml version)
export REPOSITORY=gcp-poc
gcloud builds triggers create github \
  --description="github push trigger for $PROJECT_ID" \
  --name="demo-github-push-trigger" \
  --require-approval \
  --build-config="/cloudbuild.yaml" \
  --project=$PROJECT_ID \
  --repository=projects/$PROJECT_ID/locations/$REGION/connections/$CONNECTION_NAME/repositories/$REPOSITORY \
  --service-account=projects/$PROJECT_ID/serviceAccounts/$SERVICE_ACCOUNT_ID \
  --branch-pattern="^main$" \
  --region=$REGION

# create a build trigger using the github connection (dockerfile version)
gcloud builds triggers create github \
  --description="github push trigger for $PROJECT_ID" \
  --name="demo-github-push-trigger" \
  --dockerfile-dir="/" \
  --dockerfile="Dockerfile" \
  --project=$PROJECT_ID \
  --repository=projects/$PROJECT_ID/locations/$REGION/connections/$CONNECTION_NAME/repositories/$REPOSITORY \
  --service-account=projects/$PROJECT_ID/serviceAccounts/$SERVICE_ACCOUNT_ID \
  --branch-pattern="^main$" \
  --region=$REGION

  <!-- --connection=$CONNECTION_NAME \
  --substitutions=_PROJECT_ID=$PROJECT_ID,_REPOSITORY=$REPOSITORY,_REGION=$REGION -->
  