document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggle-mode');
    const body = document.body;

    toggleButton.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        toggleButton.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
});



// Criamos o método para consultar a API do OpenAI
const ConsultarOpenAI = async (pergunta) => {

    // Aqui vamos configurar o cabeçalho da requisição
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer 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");
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

const CapturarVoz = () => {

    var startButton   = document.getElementById('capture');
    var resultElement = document.getElementById('prompt');

    var recognition = new webkitSpeechRecognition();

    recognition.lang = window.navigator.language;
    recognition.interimResults = true;

    startButton.addEventListener('click', () => { recognition.start(); });

    recognition.addEventListener('result', (event) => {
        const result = event.results[event.results.length - 1][0].transcript;
        resultElement.value = result;
    });

    recognition.addEventListener('end', () => {
        const textoCapturado = resultElement.value;
        ConsultarOpenAI(textoCapturado);
    });
    
}

const ReproduzirVoz = (resposta) => {

    var myHeaders = new Headers();
    myHeaders.append("Ocp-Apim-Subscription-Key", "d98f2a2fdcae4060819904e630e814d6");
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
