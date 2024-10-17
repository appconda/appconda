FROM node:21-alpine as production

RUN apk add --no-cache \
    python3 \
    build-base \
    make \
    g++ \
    imagemagick \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev


# Add dependencies to get Bun working on Alpine
#RUN apk --no-cache add ca-certificates wget
#RUN wget https://raw.githubusercontent.com/athalonis/docker-alpine-rpi-glibc-builder/master/glibc-2.26-r1.apk
#RUN apk add --allow-untrusted --force-overwrite glibc-2.26-r1.apk
#RUN rm glibc-2.26-r1.apk
# Install Bun
#RUN npm install -g bun

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/app

#RUN npm install pm2 -g
#RUN pm2 install typescript

COPY ./package.json .

RUN yarn

RUN ./node_modules/.bin/pm2 install typescript

COPY ./nodemon.json .
COPY ./tsconfig.json .

COPY ./src ./src

COPY ./bin /usr/local/bin
# Executables
RUN chmod +x /usr/local/bin/doctor
RUN chmod +x /usr/local/bin/install
RUN chmod +x /usr/local/bin/maintenance

RUN chmod +x /usr/local/bin/worker-audits
RUN chmod +x /usr/local/bin/worker-databases

#CMD ["node", "src/index.js"]

CMD ["npm","run","pm2"]