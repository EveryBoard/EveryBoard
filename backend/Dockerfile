FROM gcr.io/distroless/static-debian12
COPY backend /
COPY service-account.json /
ENV SERVICE_ACCOUNT /service-account.json
CMD ["/backend"]
EXPOSE 8081
