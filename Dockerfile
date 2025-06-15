# Use an official Node image as the base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code to the container
COPY . .

# Compile TypeScript (assuming you have a build script configured)
RUN npm run build

# Expose the default port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
