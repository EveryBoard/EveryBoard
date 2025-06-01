FROM scratch

COPY backend / # The backend binary itself
COPY service-account.json / # The credentials to connect to firebase
COPY ca-certificates.crt /etc/ssl/certs/ # The certicifates to verify Google's identity

# Setting up the environment variables that the backend needs
ARG USE_EMULATOR
ENV USE_EMULATOR="$USE_EMULATOR"
ARG PROJECT_ID
ENV PROJECT_ID="$PROJECT_ID"
ARG ALLOW_ORIGIN
ENV ALLOW_ORIGIN="$ALLOW_ORIGIN"
ENV SERVICE_ACCOUNT=/service-account.json

CMD ["/backend"]
EXPOSE 8081
