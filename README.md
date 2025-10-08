Suggested layout for folder


game-guild-frontend/  
├── public/                 # Static files (index.html, favicon, etc.)  
├── src/  
│   ├── assets/             # Images, fonts, etc.  
│   ├── components/         # Reusable UI components (e.g., GameEntry, UserProfile)  
│   ├── pages/              # Page components (e.g., Home, Login, Register, GameList)  
│   ├── services/           # API calls (e.g., gameEntryService.js, userService.js)  
│   ├── hooks/              # Custom React hooks  
│   ├── context/            # React context providers (e.g., AuthContext)  
│   ├── styles/             # CSS or styling files  
│   ├── App.jsx             # Main app component  
│   └── main.jsx            # Entry point  
├── .env                    # Frontend environment variables (e.g., VITE_API_URL)  
├── package.json            # Project metadata and dependencies  
├── XXXX  vite.config.js          # Vite configuration XXXXX  babel.config.js   #for app  
└── README.md               # Project documentation  



My Layout:  

gg-frontend  
    assets/  
    components/  
    pages/  
    services/  
    hooks/  
    context/  
    styles/  
    App.js  
    babel.config.js  
    package.json  

















Commands used the setup this frontend  
navigate to the folder where I want to create the frontend folder for the app  
open terminal in that base folder and do    
    npm install -g expo-cli  
Then  
    expo init gg-frontend          [gg-frontend means the name of the folder gg=gameguild]  
Then select  
    blank template                 [which shouldn't have typescript written infront of it]   

In terminal open gg-frontend ->  npm install   
then you should be good to go  
start by runnin    npx expo start      in the gg-frontend terminal  
you should get a qr code in the terminal which you should scan on your mobile phone on the ExpoGo App. Make sure you are on the same Wifi as your pc where u used the expostart command.  

I then made this directory design in the gg-frontend  
    assets/  
    components/  
    pages/  
    services/  
    hooks/  
    context/  
    styles/  
    App.js  
    babel.config.js  
    package.json  
  
in the gg-frontend terminal i did   
    npm install @react-navigation/native  
    npx expo install react-native-screens react-native-safe-area-context   
    npm install @react-navigation/bottom-tabs  



When I tranferred this test setup to where i am editing my branch for the github repo, I had error  
I had to add this code in babel.config.js  

    module.exports = function(api) {   
    api.cache(true);   
    return {  
        presets: ['babel-preset-expo'],  
        };  
    };  

And run this commands in the terminal of gg-frontend   

    npm install --save-dev babel-preset-expo   
