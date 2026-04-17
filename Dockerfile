FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN echo "LMS Project Ready"
CMD ["python", "--version"]
