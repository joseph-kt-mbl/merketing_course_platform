# Use official Node image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of code
COPY . .

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "run", "dev"]