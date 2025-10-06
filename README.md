<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Tronify Me

This application transforms your image into a Tron-inspired digital self using the power of Gemini. 

View your app in AI Studio: https://ai.studio/apps/drive/1zQssVvqRxdGJFZ2nXQAvhhGVR1CYD_h-

## Features

*   **Tronify your image:** Capture an image with your camera and have it transformed into a Tron-inspired character.
*   **Share your creation:** Share your tronified image.
*   **Tron-inspired UI:** A dark, high-tech user interface inspired by the Tron movie franchise.

## Local Development

**Prerequisites:**

*   Node.js
*   Docker

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Create a `.env` file in the root of the project and add your Gemini API key:

    ```
    GEMINI_API_KEY=your_gemini_api_key
    UPLOAD_API_KEY=your_upload_api_key
    ```

3.  Run the application locally:

    To run the application with Docker (recommended for an environment that mirrors the production deployment):

    ```bash
    sudo docker build -t tronify-me-local --build-arg GEMINI_API_KEY=$(grep GEMINI_API_KEY .env | cut -d '=' -f2) --build-arg UPLOAD_API_KEY=$(grep UPLOAD_API_KEY .env | cut -d '=' -f2) .
    sudo docker run -p 8080:8080 tronify-me-local
    ```

    The application will be available at http://localhost:8080.

    Alternatively, you can run the development server directly:

    ```bash
    npm run dev
    ```

    The application will be available at http://localhost:3000.

## Deployment

This application is configured to be deployed to Google Cloud Run using Cloud Build.

**Prerequisites:**

*   Google Cloud SDK
*   An Artifact Registry repository named `tronify-me-repo` in the `us-central1` region.

1.  Make sure you are authenticated with Google Cloud:

    ```bash
    gcloud auth login
    ```

2.  Submit the build to Cloud Build:

    ```bash
    gcloud builds submit --config cloudbuild.yaml --substitutions=_UPLOAD_API_KEY=your_upload_api_key,_GEMINI_API_KEY=your_gemini_api_key
    ```

    Replace `your_upload_api_key` and `your_gemini_api_key` with your actual API keys.