const modelOptions = [
    {
        value: "vitouphy/wav2vec2-xls-r-300m-timit-phoneme",
        description: "settingPage.pronunciationSettings.modelDescriptionHighAccuracy",
        size: "1.26GB",
    },
    {
        value: "facebook/wav2vec2-lv-60-espeak-cv-ft",
        description: "settingPage.pronunciationSettings.modelDescriptionMediumAccuracy",
        size: "1.26GB",
    },
    {
        value: "facebook/wav2vec2-xlsr-53-espeak-cv-ft",
        description: "settingPage.pronunciationSettings.modelDescriptionMediumAccuracy",
        size: "1.26GB",
    },
    {
        value: "bookbot/wav2vec2-ljspeech-gruut",
        description: "settingPage.pronunciationSettings.modelDescriptionLowAccuracy",
        size: "378MB",
    },
];

export default modelOptions;
