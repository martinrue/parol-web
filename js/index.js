window.parol = (() => {
  const $buttonSettings = document.querySelector(".buttons .settings");
  const $buttonVoice = document.querySelector(".buttons .voice");
  const $buttonSpeak = document.querySelector(".buttons .speak");
  const $buttonMediaControl = document.querySelector(".buttons .media-control");
  const $buttonDownload = document.querySelector(".buttons .download");

  const $header = document.querySelector("header");
  const $input = document.querySelector("header .input textarea");
  const $error = document.querySelector("header .error");
  const $code = document.querySelector(".code");
  const $codeInput = document.querySelector(".code textarea");

  const createState = () => {
    const local = window.location.hostname === "localhost";
    const api = local ? "http://localhost:9000" : "https://api.roboto.martinrue.com";

    return {
      api,
      codeShown: false,
      voiceFemale: true,
      audio: null,
      file: null,
      requesting: false,
      playing: false,
      finished: false
    };
  };

  let state = createState();

  const makeRequest = (text, voice, config) => {
    const body = {
      text,
      voice,
      config
    };

    const req = {
      method: "POST",
      body: JSON.stringify(body)
    };

    return fetch(state.api + "/speak", req).then(res => res.json());
  };

  const show = ($element, style) => {
    $element.style.display = style || "inline";
  };

  const hide = $element => {
    $element.style.display = "none";
  };

  const disable = $element => {
    $element.classList.add("disabled");
  };

  const enable = $element => {
    $element.classList.remove("disabled");
  };

  const showError = message => {
    $error.innerText = "Okazis eraro: " + message + ".";
    show($error, "block");
  };

  const hideError = () => {
    hide($error);
  };

  const setMediaButtonIcon = icon => {
    $buttonMediaControl.classList.remove("play");
    $buttonMediaControl.classList.remove("pause");
    $buttonMediaControl.classList.add(icon);
  };

  const playAudio = file => {
    state.file = file;
    state.playing = true;
    state.audio = new Audio(file);

    state.audio.onended = () => {
      setMediaButtonIcon("play");
      state.playing = false;
      state.finished = true;
    };

    state.finished = false;
    setMediaButtonIcon("pause");
    state.audio.play();
  };

  const speak = () => {
    if (state.requesting) {
      return;
    }

    hideError();

    state.requesting = true;
    disable($buttonSpeak);
    disable($buttonVoice);

    const resetButtons = () => {
      state.requesting = false;
      enable($buttonSpeak);
      enable($buttonVoice);
    };

    const text = $input.value;
    const voice = state.voiceFemale ? "female" : "male";
    const config = $codeInput.value;

    if (text.trim().length === 0) {
      $input.focus();
      return resetButtons();
    }

    makeRequest(text, voice, config)
      .then(data => {
        if (data.error) {
          resetButtons();
          return showError(data.error);
        }

        state.requesting = false;

        playAudio(data.url);

        hide($buttonVoice);
        hide($buttonSpeak);

        setMediaButtonIcon("pause");
        show($buttonMediaControl);

        show($buttonDownload);
      })
      .catch(err => {
        resetButtons();
        showError(err);
      });
  };

  const toggleVoice = () => {
    if (state.requesting) {
      return;
    }

    state.voiceFemale = !state.voiceFemale;

    if (state.voiceFemale) {
      $buttonVoice.classList.add("female");
      $buttonVoice.classList.remove("male");
    } else {
      $buttonVoice.classList.add("male");
      $buttonVoice.classList.remove("female");
    }
  };

  const toggleCode = () => {
    state.codeShown = !state.codeShown;
    $code.style.display = state.codeShown ? "block" : "none";

    if (state.codeShown) {
      $header.classList.remove("floating");
      $code.style.height = "calc(100% - " + ($header.clientHeight + "px") + ")";
    } else {
      $code.style.height = "auto";
      $header.classList.add("floating");
    }
  };

  const playPause = () => {
    if (state.finished) {
      playAudio(state.file);
      return;
    }

    if (state.playing) {
      state.audio.pause();
      setMediaButtonIcon("play");
      state.playing = false;
      return;
    }

    state.audio.play();
    setMediaButtonIcon("pause");
    state.playing = true;
  };

  const download = () => {
    if (state.file) {
      window.open(state.file, "_blank");
    }
  };

  const reset = () => {
    if (state.audio) {
      state.audio.pause();
    }

    state.audio = null;
    state.file = null;
    state.requesting = false;
    state.playing = false;
    state.finished = false;

    hide($buttonMediaControl);
    hide($buttonDownload);

    show($buttonVoice);
    show($buttonSpeak);

    enable($buttonVoice);
    enable($buttonSpeak);
  };

  const attachEventHandlers = () => {
    $buttonSpeak.addEventListener("click", speak);
    $buttonVoice.addEventListener("click", toggleVoice);
    $buttonSettings.addEventListener("click", toggleCode);
    $buttonMediaControl.addEventListener("click", playPause);
    $buttonDownload.addEventListener("click", download);
    $input.addEventListener("input", reset);
  };

  const preloadImages = () => {
    state.images = ["download.svg", "pause.svg", "play.svg", "voice-male.svg"].map(url => {
      const image = new Image();
      image.src = "/images/" + url;
      return image;
    });
  };

  const init = () => {
    attachEventHandlers();
    preloadImages();
  };

  return {
    init
  };
})();

window.parol.init();
