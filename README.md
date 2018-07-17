# Wallnut

*Note: Wallnut refers to a type of rock climbing gear that consists of a metal "nut" on wire. While modest in appearance, its light weight and strength are unbeatable making it a key part of every climber's rack.*

## Getting Started

These instructions will get you up and running with a new installation of Wallnut.

Note: running Wallnut will require Git, [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/).

### Installing

Begin by cloning this repository

	git clone https://github.com/chairswithlegs/wallnut.git
    
   
Next, navigate to the folder containing the package.json file and execute the following command:

	npm install
    
Wallnut will also require an active MongoDB database; you can create a database for free by signing up at [mLab](https://mlab.com/).

### Configuration

Open *Wallnut.json* and make the following changes:

	"adminCredentials": {
        "username": "YOUR USERNAME",
        "password": "YOUR PASSWORD"
    }

If this is a production environment, or port 3000 is already in use, you may need to change the following settings as well:

	"baseUrl": "YOUR SITE DOMAIN",
    "port": "YOUR PORT NUMBER",

Several environment variables will need to be set as well. Wallnut makes use of the NPM package *dotenv* for to make setting environment variables easy. To do this, create a file named *.env* in the root directory of the project, open it in your preferred text editor, and enter the following:

	CONNECTION_STRING=THE CONNECTION STRING FOR YOUR DATABASE
	JWT_KEY=YOUR SECRET KEY


You may also want to set *NODE_ENV* to *development* for enhanced error logging and application life-cycle alerts.


### Running Wallnut

Once Wallnut has been successfully configured and installed, you can start the application by executing:

	npm start
    
This will create a local server at the port specified in *Wallnut.json* (e.g. localhost:3000).

Code linting and unit testing can also be performed by executing the following commands:

	npm run lint
    npm test


## Theming

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.