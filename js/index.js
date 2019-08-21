window.parol = (() => {
  const $buttonInfo = document.querySelector(".info");
  const $buttonPopoverClose = document.querySelector(".popover .close");
  const $buttonPopoverEPO = document.querySelector(".popover .lang.epo");
  const $buttonPopoverENG = document.querySelector(".popover .lang.eng");

  const $buttonSettings = document.querySelector(".buttons .settings");
  const $buttonVoice = document.querySelector(".buttons .voice");
  const $buttonSpeak = document.querySelector(".buttons .speak");
  const $buttonMediaControl = document.querySelector(".buttons .media-control");
  const $buttonDownload = document.querySelector(".buttons .download");

  const $infoPopover = document.querySelector(".popover");
  const $infoPopoverContentENG = document.querySelector(".popover .info-eng");
  const $infoPopoverContentEPO = document.querySelector(".popover .info-epo");

  const $header = document.querySelector("header");
  const $input = document.querySelector("header .input textarea");
  const $error = document.querySelector("header .error");
  const $code = document.querySelector(".code");
  const $codeInput = document.querySelector(".code textarea");
  const $counter = document.querySelector("header .input .counter");

  const queryValue = key => {
    const query = window.location.search.substring(1);
    const vars = query.split("&");

    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split("=");

      if (decodeURIComponent(pair[0]) === key) {
        return decodeURIComponent(pair[1]);
      }
    }
  };

  const createState = () => {
    const local = window.location.hostname === "localhost";
    const api = local ? "http://localhost:9000" : "https://api.roboto.martinrue.com";

    return {
      api,
      key: queryValue("key"),
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

  const makeRequest = (text, voice, rules) => {
    const body = {
      text,
      voice,
      rules,
      key: state.key
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

  const showInfo = e => {
    e.preventDefault();
    show($infoPopover);
    hide($buttonInfo);
    $infoPopover.scrollTop = 0;
  };

  const hideInfo = e => {
    e && e.preventDefault();
    hide($infoPopover);
    show($buttonInfo);
  };

  const setInfoLanguageEPO = e => {
    e.preventDefault();
    $buttonPopoverEPO.classList.remove("off");
    $buttonPopoverENG.classList.add("off");
    show($infoPopoverContentEPO);
    hide($infoPopoverContentENG);
  };

  const setInfoLanguageENG = e => {
    e.preventDefault();
    $buttonPopoverENG.classList.remove("off");
    $buttonPopoverEPO.classList.add("off");
    show($infoPopoverContentENG);
    hide($infoPopoverContentEPO);
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
    const rules = $codeInput.value;

    if (text.trim().length === 0) {
      $input.focus();
      return resetButtons();
    }

    makeRequest(text, voice, rules)
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

  const updateCharacterCount = () => {
    const maxLength = state.key ? 3000 : 300;
    $input.maxLength = maxLength;
    $counter.innerText = maxLength - $input.value.length;
  };

  const checkForPrefill = () => {
    $input.value = (queryValue("text") || "").trim();
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

    updateCharacterCount();

    hide($buttonMediaControl);
    hide($buttonDownload);

    show($buttonVoice);
    show($buttonSpeak);

    enable($buttonVoice);
    enable($buttonSpeak);
  };

  const handleClickOutside = event => {
    if (!$infoPopover.contains(event.target)) {
      hideInfo();
    }
  };

  const attachEventHandlers = () => {
    $buttonInfo.addEventListener("click", showInfo);
    $buttonPopoverClose.addEventListener("click", hideInfo);
    $buttonPopoverEPO.addEventListener("click", setInfoLanguageEPO);
    $buttonPopoverENG.addEventListener("click", setInfoLanguageENG);

    $buttonSpeak.addEventListener("click", speak);
    $buttonVoice.addEventListener("click", toggleVoice);
    $buttonSettings.addEventListener("click", toggleCode);
    $buttonMediaControl.addEventListener("click", playPause);
    $buttonDownload.addEventListener("click", download);
    $input.addEventListener("input", reset);

    document.addEventListener("click", handleClickOutside, true);

    document.onkeydown = function(evt) {
      evt = evt || window.event;

      if (evt.keyCode === 27) {
        hideInfo();
      }
    };
  };

  const preloadImages = () => {
    state.images = [
      "download.svg",
      "pause.svg",
      "play.svg",
      "voice-male.svg",
      "eng.png",
      "eng-off.png",
      "epo.png",
      "epo-off.png",
      "close.svg"
    ].map(url => {
      const image = new Image();
      image.src = "/images/" + url;
      return image;
    });
  };

  const init = () => {
    attachEventHandlers();
    preloadImages();
    updateCharacterCount();
    checkForPrefill();
  };

  return {
    init
  };
})();

window.parol.init();
