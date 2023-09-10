FROM node:20

COPY . Visualizer

RUN cd Visualizer/visualizer && npm install

