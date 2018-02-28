FROM node:8.9.1

# Confirm working directory
USER node

RUN mkdir /home/node/.npm-global ; \
    mkdir -p /home/node/app ; \
    chown -R node:node /home/node/app ; \
    chown -R node:node /home/node/.npm-global
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /home/node/app

# Install app dependencies
COPY package.json /home/node/app
COPY package-lock.json /home/node/app

ENV NPM_CONFIG_LOGLEVEL error
RUN npm install --quiet

RUN npm install pm2 -g

ENV DOCKER=TRUE

# Bundle APP files
COPY . /home/node/app

ARG NODE_ENV
ARG PORT

# Compile app sources
RUN npm run compile

# Remove dev dependencies
# RUN npm prune --production

# Run application in production
# Moved to docker-compose.prod.yml
# CMD [ "pm2-docker", "start", "/home/node/app/pm2.json" ]

# Make port from arguments available to the world outside this container
EXPOSE $PORT
