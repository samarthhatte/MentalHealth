# Use a slim Python image
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y gcc g++ && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Set environment variables
ENV PORT 10000

# Expose port
EXPOSE 10000

# Run database migrations (if using prisma) and start server
CMD ["bash", "-c", "npx prisma migrate deploy && uvicorn main:app --host 0.0.0.0 --port $PORT"]
