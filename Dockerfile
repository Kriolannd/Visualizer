FROM ubuntu:22.04

COPY . Visualizer

RUN apt-get update \
    && apt-get -y install --no-install-recommends npm nodejs \
    && cd Visualizer/visualizer && npm install

