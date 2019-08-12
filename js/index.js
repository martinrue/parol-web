window.parol = (() => {
  const $buttonSettings = document.querySelector(".buttons .settings");
  const $buttonVoice = document.querySelector(".buttons .voice");
  const $buttonSpeak = document.querySelector(".buttons .speak");
  const $buttonMediaControl = document.querySelector(".buttons .media-control");
  const $buttonDownload = document.querySelector(".buttons .download");

  const $header = document.querySelector("header");

  const $input = document.querySelector("header .input textarea");

  const $error = document.querySelector("header .error");

  const $sectionCode = document.querySelector(".code");

  const state = {
    codeShown: false,
    voiceFemale: true,
    audio: null,
    file: null,
    playing: false,
    finished: false
  };

  const showError = message => {
    $error.innerText = message;
    show($error, "block");
  };

  const hideError = () => {
    hide($error);
  };

  const show = ($element, style) => {
    $element.style.display = style || "inline";
  };

  const hide = $element => {
    $element.style.display = "none";
  };

  const toggleSettings = () => {
    state.codeShown = !state.codeShown;
    $sectionCode.style.display = state.codeShown ? "block" : "none";

    if (state.codeShown) {
      $header.classList.remove("floating");
      $sectionCode.style.height = "calc(100% - " + ($header.clientHeight + "px") + ")";
    } else {
      $sectionCode.style.height = "auto";
      $header.classList.add("floating");
    }
  };

  const toggleVoice = () => {
    state.voiceFemale = !state.voiceFemale;

    if (state.voiceFemale) {
      $buttonVoice.classList.add("female");
      $buttonVoice.classList.remove("male");
    } else {
      $buttonVoice.classList.add("male");
      $buttonVoice.classList.remove("female");
    }
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
    playAudio("/sample.mp3");

    hide($buttonVoice);
    hide($buttonSpeak);

    setMediaButtonIcon("pause");
    show($buttonMediaControl);

    show($buttonDownload);
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

  const reset = () => {
    if (state.audio) {
      state.audio.pause();
    }

    state.audio = null;
    state.file = null;
    state.playing = false;

    hide($buttonMediaControl);
    hide($buttonDownload);

    show($buttonSpeak);
    show($buttonVoice);
  };

  const download = () => {
    if (state.file) {
      window.open(state.file, "_blank");
    }
  };

  const attachEventHandlers = () => {
    $buttonSettings.addEventListener("click", toggleSettings);
    $buttonVoice.addEventListener("click", toggleVoice);
    $buttonSpeak.addEventListener("click", speak);
    $buttonMediaControl.addEventListener("click", playPause);
    $buttonDownload.addEventListener("click", download);
    $input.addEventListener("input", reset);
  };

  const init = () => {
    attachEventHandlers();
  };

  return {
    init
  };
})();

window.parol.init();
