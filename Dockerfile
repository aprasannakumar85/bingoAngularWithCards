FROM node:latest

RUN mkdir -p /app/src

WORKDIR /app/src

COPY package.json .

RUN npm install -g npm@7.24.1

COPY . .

EXPOSE 4200

CMD ["npm", "start"]

#docker build . -t bingoangularwithcards:latest

#docker run --name bingoangularwithcards --publish 4200 --detach bingoangularwithcards:latest

#docker run -p 4200:4200 bingoangularwithcards:latest

#https://dev.to/vanwildemeerschbrent/docker-angular-setup-issue-exposed-port-not-accessible-98m
