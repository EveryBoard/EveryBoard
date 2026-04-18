FROM scratch

# The backend binary itself
COPY backend /
# The credentials to connect to firebase
COPY service-account.json /
# The certicifates to verify Google's identity
COPY ca-certificates.crt /etc/ssl/certs/

# Setting up the environment variables that the backend needs
ARG USE_EMULATOR
ENV USE_EMULATOR="$USE_EMULATOR"
ARG PROJECT_ID
ENV PROJECT_ID="$PROJECT_ID"
ARG ALLOW_ORIGIN
ENV ALLOW_ORIGIN="$ALLOW_ORIGIN"
ENV SERVICE_ACCOUNT="/service-account.json"
ENV DATABASE_TYPE="postgres"
ARG DATABASE_HOST
ARG DATABASE_USERNAME
ARG DATABASE_PASSWORD
ARG DATABASE_NAME
ENV DATABASE_DSN="postgresql://$DATABASE_USERNAME:$DATABASE_PASSWORD@$DATABASE_HOST:5432/$DATABASE_NAME?sslmode=disable"

CMD ["/backend"]
EXPOSE 8081
