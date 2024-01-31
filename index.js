var recognition = new webkitSpeechRecognition();

recognition.lang = window.navigator.language;
recognition.interimResults = false;
recognition.continuous = true;

recognition.start();

// Resolvemos o problema de não poder iniciar a captura de voz automaticamente
let h1 = document.querySelector('h1');
h1.click();

const GetKey = (service, callback) => {
    fetch('keys.json')
        .then(response => response.json())
        .then(data => {
            callback(data[service]);
        })
        .catch(error => console.error(error));
};

let openAIKey;
let MicrosoftKey;

GetKey('openai', (key) => {
    openAIKey = key;
});

GetKey('microsoft', (key) => {
    MicrosoftKey = key;
});

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggle-mode');    
    toggleButton.addEventListener('click', function () {
        TrocarTema();
    });
});

const TrocarTema = () => {

    const body = document.body;
    const isDarkMode = body.classList.contains('dark-mode');

    body.classList.toggle('dark-mode');    

    const toggleButton = document.getElementById('toggle-mode');
    toggleButton.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Criamos o método para consultar a API do OpenAI
const ConsultarOpenAI = (pergunta) => {

    // Aqui vamos configurar o cabeçalho da requisição
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer "+openAIKey);
    myHeaders.append("Cookie", "__cf_bm=v0AdReGOtspMRNHPTxBnwh4YpzHbRR3WFc5yw.Kbog0-1701178883-0-AUrAM7cQPblZhbmGBJYiRxgDAo+gYsy84++07t88g4mU3GzzmZoydnJUoPQY977YN/crgICgRVcITFTr1dYuDAs=; _cfuvid=mfC4AWHdBgbcC1SKc7l12a8t8N7UqskkQAFbDwn2o5E-1701178883225-0-604800000");

    // Aqui vamos configurar o corpo da requisição
    var raw = JSON.stringify({
    "model": "ft:gpt-3.5-turbo-0613:zeros-e-um::8PrTlJrT",
    "messages": [
        {
        "role": "system",
        "content": "Jarvis é um chatbot pontual e muito simpático que ajuda as pessoas"
        },
        {
        "role": "user",
        "content": pergunta
        }
    ],
    "temperature": 0.2
    });

    // Aqui vamos configurar o método da requisição
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    // Aqui vamos fazer a requisição
    fetch("https://api.openai.com/v1/chat/completions", requestOptions)
    .then(response => response.json())
    .then(result => ReproduzirVoz(result.choices[0].message.content))
    .catch(error => console.log('error', error));
}

const TrocarCor = (cor) => {
    var startButton = document.getElementById('capture');
    startButton.style.backgroundColor = cor;
}

const CapturarVoz = () => {

    var resultElement = document.getElementById('prompt');

    recognition.addEventListener('result', (event) => {
        
        const result = event.results[event.results.length - 1][0].transcript;         

        if (result.toLowerCase().includes('senai')) { 

            TrocarCor('#4CAF50');

            if (result.toLowerCase().includes('trocar tema')) {
                TrocarTema();
                recognition.stop();
                setTimeout(() => {
                    recognition.start();
                    TrocarCor('#dd203c');
                }, 1000);
                return;
            } 

            // Comece a salvar a pergunta quando "Jarvis" é detectado
            let array_pergunta = result.toLowerCase().split(/(senai)/);

            // Remova o que vem antes de "Jarvis"
            array_pergunta.shift();
            // ["Jarvis", "qual é a previsão", "Jarvis", "do tempo?"]
            //     0             1                 2          3

            // ['jarvis', ' quem é o ', 'jarvis', ' na marvel']
            // Remover o primeiro "Jarvis" do array
            array_pergunta.shift();

            // Unir o restante do array em uma string
            array_pergunta = array_pergunta.join('');

            // Escrevemos no input a pergunta
            resultElement.value = array_pergunta;

            // Pare a captura de voz
            recognition.stop();

            // Consulte a API do OpenAI
            ConsultarOpenAI(array_pergunta);

            // Aguarde 5 segundos e inicie a captura de voz novamente
            setTimeout(() => {
                recognition.start();
                TrocarCor('#dd203c');
            }, 5000);
        }
    });

    
}


const ReproduzirVoz = (resposta) => {

    var myHeaders = new Headers();
    myHeaders.append("Ocp-Apim-Subscription-Key", MicrosoftKey);
    myHeaders.append("Content-Type", "application/ssml+xml");
    myHeaders.append("X-Microsoft-OutputFormat", "audio-16khz-128kbitrate-mono-mp3");
    myHeaders.append("User-Agent", "curl");
    
    var raw = "<speak version='1.0' xml:lang='pt-BR'>\r\n    <voice xml:lang='pt-BR' xml:gender='Female' name='pt-BR-FranciscaNeural'>\r\n        "+resposta+"\r\n    </voice>\r\n</speak>";
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    fetch("https://brazilsouth.tts.speech.microsoft.com/cognitiveservices/v1", requestOptions)
    .then(response => {
        if (response.ok) {
            return response.arrayBuffer();
        } else {
            throw new Error(`Falha na requisição: ${response.status} - ${response.statusText}`);
        }
    })
    .then(data => {
        const blob = new Blob([data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);

        const audioElement = new Audio(audioUrl);
        audioElement.play();
    })
    .catch(error => {
        console.error('Erro:', error);
    });

}




CapturarVoz();