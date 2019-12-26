FROM ubuntu:xenial

RUN apt-get update; apt-get clean

# Add a user for running applications.
RUN useradd apps
RUN mkdir -p /home/apps && chown apps:apps /home/apps

# Install x11vnc.
RUN apt-get install -y x11vnc

# Install xvfb.
RUN apt-get install -y xvfb

# Install fluxbox.
RUN apt-get install -y fluxbox

# Install wget.
RUN apt-get install -y wget

# Install wmctrl.
RUN apt-get install -y wmctrl

# Set the Chrome repo.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list

# Install Chrome.
RUN apt-get update && apt-get -y install google-chrome-stable

#install python, seleneum, firefox, etc
RUN apt-get update && apt-get install -y \
    python python-pip curl unzip libgconf-2-4
RUN pip install selenium
ENV CHROMEDRIVER_VERSION 2.36
ENV CHROMEDRIVER_SHA256 2461384f541346bb882c997886f8976edc5a2e7559247c8642f599acd74c21d4

RUN curl -SLO "https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip" \
  && echo "$CHROMEDRIVER_SHA256  chromedriver_linux64.zip" | sha256sum -c - \
  && unzip "chromedriver_linux64.zip" -d /usr/local/bin \
  && rm "chromedriver_linux64.zip"

COPY ./bin/geckodriver /usr/local/bin/
RUN chmod a+x /usr/local/bin/geckodriver

RUN apt-get install -y software-properties-common && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys A6DCF7707EBC211F && \
    apt-add-repository "deb http://ppa.launchpad.net/ubuntu-mozilla-security/ppa/ubuntu xenial main" && \
    apt-get update && \
    apt-get install -y firefox

RUN apt-get install -y sudo && \
    echo "apps ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/apps && \
    chmod 0440 /etc/sudoers.d/apps

#install nginx
RUN apt-get install -y nginx psmisc net-tools mc htop

COPY ./nginx/default.conf /etc/nginx/sites-enabled/default

RUN pip install --upgrade pip
RUN pip install redis psycopg2-binary datetime

COPY bootstrap.sh /

CMD '/bootstrap.sh'