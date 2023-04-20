var OPENAI_API_KEY = "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";
var bTextToSpeechSupported = false;
var bSpeechInProgress = false;
var oSpeechRecognizer = null
var oSpeechSynthesisUtterance = null;
var oVoices = null;

function OnLoad() {
  if ("webkitSpeechRecognition" in window) {
  } else {
    //speech to text not supported
    lblSpeak.style.display = "none";
  }

  if ('speechSynthesis' in window) {
    bTextToSpeechSupported = true;

    speechSynthesis.onvoiceschanged = function () {
      oVoices = window.speechSynthesis.getVoices();
      for (var i = 0; i < oVoices.length; i++) {
        selVoices[selVoices.length] = new Option(oVoices[i].name, i);
      }
    };
  }
}

function ChangeLang(o) {
  if (oSpeechRecognizer) {
    oSpeechRecognizer.lang = selLang.value;
    //SpeechToText()
  }
}

function Send() {

  var sQuestion = txtMsg.value;
  if (sQuestion == "") {
    alert("Type in your question!");
    txtMsg.focus();
    return;
  }

  var oHttp = new XMLHttpRequest();
  oHttp.open("POST", "https://api.openai.com/v1/chat/completions");
  oHttp.setRequestHeader("Accept", "application/json");
  oHttp.setRequestHeader("Content-Type", "application/json");
  oHttp.setRequestHeader("Authorization", "Bearer " + OPENAI_API_KEY)

  oHttp.onreadystatechange = function () {
    if (oHttp.readyState === 4) {
      //console.log(oHttp.status);
      var oJson = {}
      if (txtOutput.value != "") txtOutput.value += "\n";

      try {
        oJson = JSON.parse(oHttp.responseText);
      } catch (ex) {
        txtOutput.value += "Error: " + ex.message
      }

      if (oJson.error && oJson.error.message) {
        txtOutput.value += "Error: " + oJson.error.message;
      } else if (oJson.choices && oJson.choices[0].text) {
        var s = oJson.choices[0].text;

        if (selLang.value != "en-US") {
          var a = s.split("?\n");
          if (a.length == 2) {
            s = a[1];
          }
        }

        if (s == "") s = "No response";
        txtOutput.value += "Chat GPT: " + s;
        TextToSpeech(s);
      }      
    }
  };

  var sModel = selModel.value;// "text-davinci-003";
  var iMaxTokens = 50;
  var sUserId = "1";
  var dTemperature = 0;  

  var data = {
    model: sModel,
    prompt: sQuestion,
    max_tokens: iMaxTokens,
    user: sUserId,
    temperature: dTemperature,
    frequency_penalty: 0.0, //Number between -2.0 and 2.0 
                               //Positive values decrease the model's likelihood 
                               //to repeat the same line verbatim.
    presence_penalty: 0.0, //Number between -2.0 and 2.0. 
                               //Positive values increase the model's likelihood 
                               //to talk about new topics.
    stop: ["#", ";"]        //Up to 4 sequences where the API will stop 
                               //generating further tokens. The returned text 
                               //will not contain the stop sequence.
  }

  oHttp.send(JSON.stringify(data));

  if (txtOutput.value != "") txtOutput.value += "\n";
  txtOutput.value += "Me: " + sQuestion;
  txtMsg.value = "";
}

function TextToSpeech(s) {
  if (bTextToSpeechSupported == false) return;
  if (chkMute.checked) return;

  oSpeechSynthesisUtterance = new SpeechSynthesisUtterance();

  if (oVoices) {
    var sVoice = selVoices.value;
    if (sVoice != "") {
      oSpeechSynthesisUtterance.voice = oVoices[parseInt(sVoice)];
    }    
  }  

  oSpeechSynthesisUtterance.onend = function () {
    //finished talking - can now listen
    if (oSpeechRecognizer && chkSpeak.checked) {
      oSpeechRecognizer.start();
    }
  }

  if (oSpeechRecognizer && chkSpeak.checked) {
    //do not listen to yourself when talking
    oSpeechRecognizer.stop();
  }

  oSpeechSynthesisUtterance.lang = selLang.value;
  oSpeechSynthesisUtterance.text = s;
  //Uncaught (in promise) Error: A listener indicated an 
   //asynchronous response by returning true, but the message channel closed
  window.speechSynthesis.speak(oSpeechSynthesisUtterance);
}

function Mute(b) {
  if (b) {
    selVoices.style.display = "none";
  } else {
    selVoices.style.display = "";
  }
}

function SpeechToText() {

  if (oSpeechRecognizer) {

    if (chkSpeak.checked) {
      oSpeechRecognizer.start();
    } else {
      oSpeechRecognizer.stop();
    }

    return;
  }  

  oSpeechRecognizer = new webkitSpeechRecognition();
  oSpeechRecognizer.continuous = true;
  oSpeechRecognizer.interimResults = true;
  oSpeechRecognizer.lang = selLang.value;
  oSpeechRecognizer.start();

  oSpeechRecognizer.onresult = function (event) {
    var interimTranscripts = "";
    for (var i = event.resultIndex; i < event.results.length; i++) {
      var transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        txtMsg.value = transcript;
        Send();
      } else {
        transcript.replace("\n", "<br>");
        interimTranscripts += transcript;
      }

      var oDiv = document.getElementById("idText");
      oDiv.innerHTML = '<span style="color: #999;">' + 
                              interimTranscripts + '</span>';
    }
  };

  oSpeechRecognizer.onerror = function (event) {

  };
}



























var audio = new Audio('assets/sentmessage.mp3');
var contactString = "<div class='social'> <a target='_blank' href='tel:+918951016242'> <div class='socialItem' id='call'><img class='socialItemI' src='images/phone.svg'/><label class='number'></label></label></div> </a> <a href='mailto:deepak.cs021@gmail.com'> <div class='socialItem'><img class='socialItemI' src='images/gmail.svg' alt=''></div> </a> <a target='_blank' href='https://github.com/deepak-05'> <div class='socialItem'><img class='socialItemI' src='images/github.svg' alt=''></div> </a> <a target='_blank' href='https://wa.me/8951016242'> <div class='socialItem'><img class='socialItemI' src='images/whatsapp.svg' alt=''>";
var resumeString = "<img src='images/resume_thumbnail.png' class='resumeThumbnail'><div class='downloadSpace'><div class='pdfname'><img src='images/pdf.png'><label>Deepak A C.pdf</label></div><a href='assets/varshith_v_hegde_resume.pdf' download='varshith_v_hegde_resume.pdf'><img class='download' src='images/downloadIcon.svg'></a></div>";
var addressString = "<div class='mapview'><iframe src='https://www.google.com/maps/dir//Moodbidri+private+Bus+Stand,+Bus+Stand+Rd,+Mudbidri,+Karnataka+574227/@13.0639,74.9991985,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba4ab3d49331379:0x17be05cb5b69caa2!2m2!1d74.9957298!2d13.0680955?hl=en' class='map'></iframe></div><label class='add'><address>B2 'Asara'<br>Kodoli<br>Kolhapur, Maharashtra, INDIA 416114</address>";

function startFunction() {
    setLastSeen();
    waitAndResponce("intro");
}

function setLastSeen() {
    var date = new Date();
    var lastSeen = document.getElementById("lastseen");
    lastSeen.innerText = "last seen today at " + date.getHours() + ":" + date.getMinutes()
}


function closeFullDP() {
    var x = document.getElementById("fullScreenDP");
    if (x.style.display === 'flex') {
        x.style.display = 'none';
    } else {
        x.style.display = 'flex';
    }
}

function openFullScreenDP() {
    var x = document.getElementById("fullScreenDP");
    if (x.style.display === 'flex') {
        x.style.display = 'none';
    } else {
        x.style.display = 'flex';
    }
}


function isEnter(event) {
    if (event.keyCode == 13) {
        sendMsg();
    }
}

function sendMsg() {
    var input = document.getElementById("inputMSG");
    var ti = input.value;
    if (input.value == "") {
        return;
    }
    var date = new Date();
    var myLI = document.createElement("li");
    var myDiv = document.createElement("div");
    var greendiv = document.createElement("div");
    var dateLabel = document.createElement("label");
    dateLabel.innerText = date.getHours() + ":" + date.getMinutes();
    myDiv.setAttribute("class", "sent");
    greendiv.setAttribute("class", "green");
    dateLabel.setAttribute("class", "dateLabel");
    greendiv.innerText = input.value;
    myDiv.appendChild(greendiv);
    myLI.appendChild(myDiv);
    greendiv.appendChild(dateLabel);
    document.getElementById("listUL").appendChild(myLI);
    var s = document.getElementById("chatting");
    s.scrollTop = s.scrollHeight;
    setTimeout(function () { waitAndResponce(ti) }, 1500);
    input.value = "";
    playSound();
}

function waitAndResponce(inputText) {
    var lastSeen = document.getElementById("lastseen");
    lastSeen.innerText = "typing...";
    var name="";
    if(inputText.toLowerCase().includes("my name is")){
        name=inputText.substring(inputText.indexOf("is")+2);
        if(name.toLowerCase().includes("omega")){
            sendTextMessage("Ohh! That's my name too");
            
        }
        inputText="input";
    }
    switch (inputText.toLowerCase().trim()) {
        case "intro":
            setTimeout(() => {
                sendTextMessage("Hello there 👋🏻,I Am a chat bot and i am here to help you ;)");
            }, 2000);
            break;
        
        

        case "help":
            sendTextMessage("<span class='sk'>Send Keyword to get what you want to know about me...<br>e.g<br><span class='bold'>'skills'</span> - to know my skills<br><span class='bold'>'resume'</span> - to get my resume<br><span class='bold'>'education'</span> - to get my education details<br><span class='bold'>'contact'</span> - to get ways to connect with me<br><span class='bold'>'projects'</span> - to get details of my projects<br><span class='bold'>'clear'</span> - to clear conversation<br>");
            break;
        case "resume":
            sendTextMessage(resumeString);
            break;
        case "skills":
            sendTextMessage("<span class='sk'>I am currently pursuing B.E degree in Computer Science Engineering.<br><br>I can comfortably write code in following languages :<br><span class='bold'>Java<br>C<br>PHP<br>Kotlin<br>Dart<br><br>CSS<br>HTML<br>JavaScript</span><br><br>I am well versed with following frameworks :<span class='bold'><br>Android<br>Flutter<br>ReactJs</span><br>");
            break;

        case "education":
            sendTextMessage("I am currently pusuing B.E degree in Computer Science Engineering from MITE Moodabidri<br>Passing Year : 2023<br><br>I have completed my PU from Excellent PU College Moodabidri<br>Passing Year:2019<br>Result:94%<br><br>I have completed my Secondary school from local school known as M K Shetty<br>Passing Year:2017");
            break;

        case "bye":
            sendTextMessage("It was nice talking to you bye");
            break;

        
        case "clear":
            clearChat();
            break;
        // case "about":

        //     break;
        case "contact":
            sendTextMessage(contactString);
            break;
        case "projects":
            sendTextMessage("You want to check my projects? Then just jump into my Github Account.<br><br><div class='social'><a target='_blank' href='https://github.com/Varshithvhegde'> <div class='socialItem'><img class='socialItemI' src='images/github.svg' alt=''></div> </a></div>");
            break;
        case "time":
            var date = new Date();
            sendTextMessage("Current time is " + date.getHours() + ":" + date.getMinutes());
            break;

        case "date":
            var date = new Date();
            sendTextMessage("Current date is " + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear());
            break;

        case "hai":
            sendTextMessage("Hello there 👋🏻");
            sendTextMessage("<span class='sk'>Send Keyword to get what you want to know about me...<br>e.g<br><span class='bold'>'skills'</span> - to know my skills<br><span class='bold'>'resume'</span> - to get my resume<br><span class='bold'>'education'</span> - to get my education details<br><span class='bold'>'contact'</span> - to get ways to connect with me<br><span class='bold'>'projects'</span> - to get details of my projects<br><span class='bold'>'clear'</span> - to clear conversation<br>");
            break;
        case "hello":
            sendTextMessage("Hello there 👋🏻");
            sendTextMessage("<span class='sk'>Send Keyword to get what you want to know about me...<br>e.g<br><span class='bold'>'skills'</span> - to know my skills<br><span class='bold'>'resume'</span> - to get my resume<br><span class='bold'>'education'</span> - to get my education details<br><span class='bold'>'contact'</span> - to get ways to connect with me<br><span class='bold'>'projects'</span> - to get details of my projects<br><span class='bold'>'clear'</span> - to clear conversation<br>");
            break;
        
        case "hi":
            sendTextMessage("Hello there 👋🏻");
            sendTextMessage("<span class='sk'>Send Keyword to get what you want to know about me...<br>e.g<br><span class='bold'>'skills'</span> - to know my skills<br><span class='bold'>'resume'</span> - to get my resume<br><span class='bold'>'education'</span> - to get my education details<br><span class='bold'>'contact'</span> - to get ways to connect with me<br><span class='bold'>'projects'</span> - to get details of my projects<br><span class='bold'>'clear'</span> - to clear conversation<br>");
            break;
        
        case "hey":
            sendTextMessage("Hello there 👋🏻");
            sendTextMessage("<span class='sk'>Send Keyword to get what you want to know about me...<br>e.g<br><span class='bold'>'skills'</span> - to know my skills<br><span class='bold'>'resume'</span> - to get my resume<br><span class='bold'>'education'</span> - to get my education details<br><span class='bold'>'contact'</span> - to get ways to connect with me<br><span class='bold'>'projects'</span> - to get details of my projects<br><span class='bold'>'clear'</span> - to clear conversation<br>");
            break;
       

        case "Chat":
            sendTextMessage("Yes, that's me");
            break;
        case "Deepak A C":
            sendTextMessage("Yes, that's me");
            break;
        case "Chat GPT":
            sendTextMessage("Yes, that's me");
            break;
        
        case "website":
            sendTextMessage("You can check my website here <a target='_blank' href='https://.github.io/'>Deepak A C</a>");
            break;
        case "blog":
            sendTextMessage("You can check my blog here <a target='_blank' href='https://.github.io/hugo-blog'>Deepak A C</a>");
            break;
        
        case "github":
            sendTextMessage("You can check my github here <a target='_blank' href='https://github.com/deepak-5'>Deepak A C</a>");
            break;
        case "linkedin":
            sendTextMessage("You can check my linkedin here <a target='_blank' href='https://www.linkedin.com/in/varshithvhegde'>Deepak A C</a>");
            break;
        case "friends":
        case "friend":
            sendTextMessage("I am always ready to make new friends");
            break;
        case "input":
            setTimeout(()=>{
                // sendTextMessage("What a coincidence!");
                sendTextMessage("Hello "+name+"! How are you?");
            },2000);
            
            break;
        default:
            setTimeout(() => {
                sendTextMessage("Hey I couldn't catch you...😢<br>Send 'help' to know more about usage.");
            }, 2000);
            break;
    }



}


function clearChat() {
    document.getElementById("listUL").innerHTML = "";
    waitAndResponce('intro');
}



function sendTextMessage(textToSend) {
    setTimeout(setLastSeen, 1000);
    var date = new Date();
    var myLI = document.createElement("li");
    var myDiv = document.createElement("div");
    var greendiv = document.createElement("div");
    var dateLabel = document.createElement("label");
    dateLabel.setAttribute("id", "sentlabel");
    dateLabel.id = "sentlabel";
    dateLabel.innerText = date.getHours() + ":" + date.getMinutes();
    myDiv.setAttribute("class", "received");
    greendiv.setAttribute("class", "grey");
    greendiv.innerHTML = textToSend;
    myDiv.appendChild(greendiv);
    myLI.appendChild(myDiv);
    greendiv.appendChild(dateLabel);
    document.getElementById("listUL").appendChild(myLI);
    var s = document.getElementById("chatting");
    s.scrollTop = s.scrollHeight;
    playSound();
}


function sendResponse() {
    setTimeout(setLastSeen, 1000);
    var date = new Date();
    var myLI = document.createElement("li");
    var myDiv = document.createElement("div");
    var greendiv = document.createElement("div");
    var dateLabel = document.createElement("label");
    dateLabel.innerText = date.getHours() + ":" + date.getMinutes();
    myDiv.setAttribute("class", "received");
    greendiv.setAttribute("class", "grey");
    dateLabel.setAttribute("class", "dateLabel");
    greendiv.innerText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. ";
    myDiv.appendChild(greendiv);
    myLI.appendChild(myDiv);
    greendiv.appendChild(dateLabel);
    document.getElementById("listUL").appendChild(myLI);
    var s = document.getElementById("chatting");
    s.scrollTop = s.scrollHeight;
    playSound();
}

function playSound() {
    audio.play();
}
