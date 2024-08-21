import React, { useEffect } from "react";
import TopNavBar from "./TopNavBar";

const HelpPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <div>
            <TopNavBar />
            <div className="p-4 p-md-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8 mb-5">
                        <h1 className="mb-4 text-center fw-bold">Oxford iSpeaker help</h1>
                        <h3 className="fw-semibold mb-4">
                            <a name="_Contents"></a>Contents
                        </h3>
                        <h5 className="mb-4 mt-4">
                            <a href="#section_1">1 What is the Oxford iSpeaker?</a>
                        </h5>
                        <h5 className="mb-4 mt-4">
                            <a href="#2_sounds">2 Sounds</a>
                        </h5>
                        <h5 className="mb-4 mt-4">
                            <a href="#3_exe">3 Exercise</a>
                        </h5>
                        <h5 className="mb-4 mt-4">
                            <a href="#4_conversations">4 Conversations</a>
                        </h5>
                        <h5 className="mb-4 mt-4">
                            <a href="#5_exam">5 Exam Speaking</a>
                        </h5>
                        <h5 className="mb-4 mt-4">
                            <a href="#6_compat">6 Browser Compatibility</a>
                        </h5>
                        <div className="mt-5 mb-5 border-top"></div>
                        <h4 className="fw-semibold mb-4 mt-4">
                            <a name="section_1"></a>
                            <a name="_1_What_is"></a>1 What is the Oxford iWriter?
                        </h4>
                        <p>
                            The Oxford iSpeaker will help you improve your speaking ability in English. It is an interactive tool designed for
                            learners of English who want to speak more accurately and fluently in a variety of situations. It is divided into four
                            sections, each with a focus on a different element of spoken English.
                        </p>
                        <p>
                            In <strong>Sounds</strong>, you can learn and practise the individual vowel and consonant sounds that make up English
                            words. The <strong>Exercises</strong> section provides practice in many aspects of pronunciation, such as sounds and
                            spelling, word stress and syllables. In <strong>Conversations</strong>, you can learn and practise useful phrases that are
                            often used in everyday English. The <strong>Exam Speaking</strong> section contains a range of tasks that typically appear
                            in English speaking exams.
                        </p>
                        <p>
                            When selecting activities in <strong>Sounds</strong>, <strong>Exercises</strong> and <strong>Conversations</strong>, you
                            can choose to focus on British or American English.
                        </p>
                        <p>
                            This is one of{" "}
                            <i>
                                <a href="https://www.oxfordlearnersdictionaries.com">Oxford Learner's Dictionaries</a>
                            </i>{" "}
                            premium features. It is also available on DVD included in <em>Oxford Advanced Learner's Dictionary 9th Edition</em>. If
                            you don't have one of those, you can visit this website to use Oxford iSpeaker.
                        </p>
                        <p>
                            <a name="_2_Model_mode"></a>
                            <a href="#_Contents">Back to Help contents</a>
                        </p>
                        <div className="mt-5 mb-5 border-top"></div>
                        <h4 className="fw-semibold mb-4 mt-4">
                            <a name="2_sounds"></a>2 Sounds
                        </h4>
                        <p>
                            Choose <strong>Sounds</strong> to view the menu of different sounds that you can practise. All the consonants, vowels and
                            diphthongs used in English are listed here.
                        </p>
                        <p>
                            If you select the Information icon to the right of each sound, you will see a list of some words that contain the sound.
                        </p>
                        <p>
                            To open, just select <strong>Go</strong> in the <strong>British</strong> or <strong>American</strong> column to the right
                            of the sound you are interested in. For some sounds, <strong>Go</strong> is only displayed in one column because of the
                            differences between British and American English.
                        </p>
                        <p>
                            In the <strong>Watch</strong> section, you can watch a video showing how to pronounce the sound and some words that
                            contain the sound.
                        </p>
                        <p>
                            The <strong>Practise</strong> section includes several shorter videos, which show the pronunciation of the sound and the
                            words separately. You can use the Record and Play buttons next to the videos to record and listen to yourself repeating
                            the sound and the words. <strong>Next</strong> to each video, you can read the relevant written forms and phonetic
                            transcriptions.
                        </p>
                        <p>
                            In the <strong>Review</strong> section, you can assess your own pronunciation of the sound.
                        </p>
                        <p>
                            <a name="_2_Model_mode"></a>
                            <a href="#_Contents">Back to Help contents</a>
                        </p>
                        <div className="mt-5 mb-5 border-top"></div>
                        <h4 className="fw-semibold mb-4 mt-4">
                            <a name="3_exe"></a>3 My Exercise
                        </h4>
                        <p>
                            Choose <strong>Exercises</strong> to view the menu of different types of exercise that are available. Eight types of
                            exercise are included in this section:
                        </p>
                        <ul>
                            <li>
                                <a href="#_Dictation">Dictation</a>
                            </li>
                            <li>
                                <a href="#_Match">Match-up</a>
                            </li>
                            <li>
                                <a href="#_Reordering">Reordering</a>
                            </li>
                            <li>
                                <a href="#_SoundsSpelling">Sounds and Spelling</a>
                            </li>
                            <li>
                                <a href="#_Sorting">Sorting</a>
                            </li>
                            <li>
                                <a href="#_OddOut">Odd One Out</a>
                            </li>
                            <li>
                                <a href="#_Snap">Snap!</a>
                            </li>
                            <li>
                                <a href="#_MemMatch">Memory Match</a>
                            </li>
                        </ul>
                        <p>
                            If you select the Information icon <img src="images/ispeaker/info_btn.svg" height="20" width="20" /> to the right of each
                            exercise title, you will see a brief description of the exercise.
                        </p>
                        <p>
                            To open, just select <strong>Go</strong> in the <strong>British</strong> or <strong>American</strong> column to the right
                            of the exercise you are interested in.
                        </p>
                        <p>
                            When the page opens, you will see instructions for the exercise you have selected. If you are using the iSpeaker on a
                            smartphone, tap the three horizontal bars in the top left to hide or show the instructions.
                        </p>
                        <p>
                            The exercise appears in the <strong>Practise</strong> section. Your session will end when you select <strong>Quit</strong>{" "}
                            or, in the timed activities, when the timer runs out. The <strong>Review</strong> section will open at the end of your
                            session to show your score. You can open the Review section at any time and see your score without ending the activity.
                        </p>
                        <h5 className="fw-semibold mb-4 mt-4">
                            <a name="_Dictation"></a>Dictation
                        </h5>
                        <p>
                            The exercises in <strong>Dictation</strong> include words that are commonly misspelled in English.
                        </p>
                        <p>
                            In each exercise, select the speaker icon to listen to a word or sentence, and type the word, missing word or sentence in
                            the space provided.
                        </p>
                        <p>
                            In <strong>Words</strong>, listen and type the single word you hear. In <strong>Missing words</strong>, look at the gapped
                            sentence, listen to the complete sentence and type the missing word you hear. In <strong>Sentences</strong>, listen to a
                            sentence and type everything you hear. <strong>Random</strong> includes a selection of questions from the other three
                            exercises.
                        </p>
                        <p>
                            Press the <strong>Submit</strong> button to find out whether your answer is correct or incorrect. You must spell
                            everything correctly. In <strong>Sentences</strong>, you do not need to use a capital letter at the start of each sentence
                            or a full stop at the end. If your answer is incorrect, the correct answer will be displayed below. Use the{" "}
                            <strong>Next</strong> button to move to the next question or to skip a question. If you choose to skip a question, it will
                            count as an incorrect answer. When you want to stop, select <strong>Quit</strong> to see your score for the session.
                        </p>
                        <h5 className="fw-semibold mb-4 mt-4">
                            <a name="_Match"></a>Match-up
                        </h5>
                        <p>
                            The exercises in <strong>Match-up</strong> include words that contain similar sounds or letter combinations.
                        </p>
                        <p>
                            In each exercise, look at the group of six words or phonetic transcriptions on the right. Select each of the speaker icons
                            on the left to listen to words or sentences. Rearrange the words or phonetic transcriptions so that they are next to the
                            corresponding speaker icons.
                        </p>
                        <p>
                            In <strong>Similar sounds</strong>, match the words you see to the words you hear. In{" "}
                            <strong>
                                <strong>Reading phonetics</strong>
                            </strong>
                            , match the phonetic transcriptions you see to the words you hear. In <strong>Comprehension</strong>, match the words you
                            see to the sentences you hear - each sentence contains one of the words. <strong>Random</strong> includes a selection of
                            questions from the other three exercises.
                        </p>
                        <p>
                            Once you have finished rearranging a group of words or phonetic transcriptions, press the <strong>Submit</strong> button
                            to find out which of your answers are correct and which are incorrect. Use the <strong>Next</strong> button to move to the
                            next question or to skip a question. If you choose to skip a question, the six items in that question will count as
                            incorrect answers. When you want to stop, select <strong>Quit</strong> to see your score for the session.
                        </p>
                        <h5 className="fw-semibold mb-4 mt-4">
                            <a name="_Reordering"></a>Reordering
                        </h5>
                        <p>
                            The exercises in <strong>Reordering</strong> include words that commonly feature in academic writing and phrasal verbs.
                        </p>
                        <p>
                            In <strong>Words</strong>, select the speaker icon to listen to a word and rearrange the letters to form the word you
                            hear. In <strong>Sentences</strong>, select the speaker icon to listen to a sentence and rearrange the words to form the
                            sentence you hear. <strong>Random</strong> includes a selection of questions from the other two exercises.
                        </p>
                        <p>
                            Press the <strong>Submit</strong> button to find out whether or not your answer is correct. You have five minutes to form
                            as many correct words or sentences as possible. The timer will begin when you start rearranging the first set of letters
                            or words, and your score will be displayed when the timer runs out. Use the <strong>Next</strong> button to move to the
                            next question or to skip a question. If you choose to skip a question, it will count as an incorrect answer. If you want
                            to stop before the timer runs out, select <strong>Quit</strong> to see your score for the session.
                        </p>
                        <h5 className="fw-semibold mb-4 mt-4">
                            <a name="_SoundsSpelling"></a>Sounds and Spelling
                        </h5>
                        <p>
                            The exercises in <strong>Sounds and Spelling</strong> include words that contain vowel sounds that are spelled in
                            different ways in English.
                        </p>
                        <p>
                            Choose the sound that you would like to practise from the <strong>Sounds and Spelling</strong> menu on the home page.{" "}
                            <strong>Random</strong> includes a selection of questions from each of the other exercises. In each exercise, select the
                            speaker icon to listen to a word containing the sound you have chosen. Choose the correct spelling of the sound from the
                            options below.
                        </p>
                        <p>
                            Press the <strong>Submit</strong> button to find out whether your answer is correct or incorrect. Use the{" "}
                            <strong>Next</strong> button to move to the next question or to skip a question. If you choose to skip a question, it will
                            count as an incorrect answer. When you want to stop, select <strong>Quit</strong> to see your score for the session.
                        </p>
                        <h5 className="fw-semibold mb-4 mt-4">
                            <a name="_Sorting"></a>Sorting
                        </h5>
                        <p>
                            The exercises in <strong>Sorting</strong> include words that contain similar sounds, or that have similar word stress
                            patterns or numbers of syllables.
                        </p>
                        <p>
                            In each exercise, move the words you see in the table into the correct column, according to the categories given at the
                            top of the columns.
                        </p>
                        <p>
                            In <strong>Similar sounds</strong>, the words should be categorized according to the sounds they contain. In{" "}
                            <strong>Word stress</strong>, the categories show word stress patterns. In <strong>Syllables</strong>, you should
                            categorize the words according to the number of syllables they have. <strong>Random</strong> includes a selection of
                            questions from the other three exercises.
                        </p>
                        <p>
                            Once you have finished moving the words between the columns, press the <strong>Submit</strong> button to find out which of
                            your answers are correct and which are incorrect. Use the <strong>Next</strong> button to move to the next question or to
                            skip a question. If you choose to skip a question, the ten items in that question will count as incorrect answers. When
                            you want to stop, select <strong>Quit</strong> to see your score for the session.
                        </p>
                        <h5 className="fw-semibold mb-4 mt-4">
                            <a name="_OddOut"></a>Odd One Out
                        </h5>
                        <p>
                            The exercises in <strong>Odd One Out</strong> include words that rhyme, or that have similar word stress patterns or
                            numbers of syllables.
                        </p>
                        <p>In each exercise, look at the four words and choose the word that is different from the other words in the group.</p>
                        <p>
                            In <strong>Word stress</strong>, the odd one out has a different word stress pattern. In <strong>Rhyming words</strong>,
                            the odd one out ends in a different sound. In <strong>Syllables</strong>, the odd one out has a different number of
                            syllables. <strong>Random</strong> includes a selection of questions from the other three exercises.
                        </p>
                        <p>
                            Press the <strong>Submit</strong> button to find out whether your answer is correct or incorrect. Use the{" "}
                            <strong>Next</strong> button to move to the next question or to skip a question. If you choose to skip a question, it will
                            count as an incorrect answer. When you want to stop, select <strong>Quit</strong> to see your score for the session.
                        </p>
                        <h5 className="fw-semibold mb-4 mt-4">
                            <a name="_Snap"></a>Snap!
                        </h5>
                        <p>
                            The exercises in <strong>Snap!</strong> include pairs of words that are spelled differently but sound similar or have the
                            same pronunciation.
                        </p>
                        <p>
                            In{" "}
                            <strong>
                                <strong>Reading phonetics</strong>
                            </strong>
                            , look at the phonetic transcription and the written form of the word. Select <strong>Yes</strong> if they match or{" "}
                            <strong>No</strong> if not. In <strong>Homophones</strong>, look at the two words and select <strong>Yes</strong> if the
                            pronunciation is the same or <strong>No</strong> if it is different. <strong>Random</strong> includes a selection of
                            questions from the other two exercises.
                        </p>
                        <p>
                            You have two minutes to answer as many questions as possible. The timer will begin when you open the exercise, and your
                            score will be displayed when the timer runs out. Use the <strong>Next</strong> button to move to the next question or to
                            skip a question. If you choose to skip a question, it will count as an incorrect answer. If you want to stop before the
                            timer runs out, select <strong>Quit</strong> to see your score for the session.
                        </p>
                        <h5 className="fw-semibold mb-4 mt-4">
                            <a name="_MemMatch"></a>Memory Match
                        </h5>
                        <p>
                            The exercises in <strong>Memory Match</strong> include pairs of words that end in the same sound, or that are spelled
                            differently but have the same pronunciation.
                        </p>
                        <p>
                            Turn over two cards at a time to reveal two words. If the words match, the cards remain visible. If not, the cards turn
                            over again.
                        </p>
                        <p>
                            In <strong>Rhyming words</strong>, find pairs of words that end in the same sound (for example, <i>ache</i> and{" "}
                            <i>fake</i>). In <strong>Homophones</strong>, find pairs of words that are spelled differently but have the same
                            pronunciation (for example, <i>higher</i> and <i>hire</i>). <strong>Random</strong> includes a selection of questions from
                            the other two exercises.
                        </p>
                        <p>
                            You have five minutes to complete the game. Try to reveal all eight pairs of words before the timer runs out. The timer
                            will begin when you turn over the first pair. If you want to stop before the timer runs out, select <strong>Quit</strong>.
                        </p>
                        <p>
                            <a name="_2_Model_mode"></a>
                            <a href="#_Contents">Back to Help contents</a>
                        </p>
                        <div className="mt-5 mb-5 border-top"></div>
                        <h4 className="fw-semibold mb-4 mt-4">
                            <a name="4_conversations"></a>4 Conversations
                        </h4>
                        <p>
                            Choose <strong>Conversations</strong> to view the menu of different types of conversational language you can practise.
                        </p>
                        <p>
                            If you select the Information icon <img src="images/ispeaker/info_btn.svg" height="20" width="20" /> to the right of each
                            language function, a panel containing a brief description of the type of conversational language included will be
                            displayed.
                        </p>
                        <p>
                            To open, just select <strong>Go</strong> in the <strong>British</strong> or <strong>American</strong> column to the right
                            of the language function you are interested in.
                        </p>
                        <p>
                            When the page for the language function you have selected opens, you will see expandable <strong>Useful Language</strong>{" "}
                            lists. These lists contain phrases and expressions that are relevant to the language function that you have chosen. Select
                            the speaker icons to listen to each phrase or expression. If you are using the iSpeaker on a smartphone, tap the three
                            horizontal bars in the top left to hide or show the <strong>Useful Language</strong> lists.
                        </p>
                        <p>
                            In the <strong>Watch</strong> section, you can watch a video showing the language in context. You will see two or three
                            people having a conversation at work, at home or out and about.
                        </p>
                        <p>
                            The <strong>Study</strong> section includes a transcript of the video. You can highlight the language that relates to
                            particular language functions by checking the relevant boxes in the grey bar at the bottom of the <strong>Study</strong>{" "}
                            section.
                        </p>
                        <p>
                            In the <strong>Practise</strong> section, you can read and listen to gapped versions of the conversation and provide the
                            key language yourself. Use the <strong>Play</strong>{" "}
                            <s>
                                and <strong>Record</strong>
                            </s>{" "}
                            buttons to listen to the lines spoken by one speaker in the conversation,{" "}
                            <s>and record and listen to yourself taking the other role</s>. You can find the language that you should use to fill the
                            gaps in the dialogue in the <strong>Useful Language</strong> lists. You can then carry out the same activity, playing the
                            part of the other speaker. You can also write your own conversation in the box at the bottom of the Practise section, and
                            then record and listen to yourself.
                        </p>
                        <p>
                            In the <strong>Review</strong> section, you can assess your own performance.
                        </p>
                        <p>
                            <a name="_2_Model_mode"></a>
                            <a href="#_Contents">Back to Help contents</a>
                        </p>
                        <div className="mt-5 mb-5 border-top"></div>
                        <h4 className="fw-semibold mb-4 mt-4">
                            <a name="5_exam"></a>5 Exam Speaking
                        </h4>
                        <p>
                            Choose <strong>Exam Speaking</strong> to view the menu of different types of speaking tasks you can practise.
                        </p>
                        <p>
                            If you point to the Information icon to the right of each speaking task, you will see a brief description of the usual
                            requirements for each task type.
                        </p>
                        <p>To open, just select the speaking task title.</p>
                        <p>
                            When the page for the speaking task you have selected opens, you will see expandable <strong>Useful Language</strong>{" "}
                            lists. These lists contain phrases and expressions that are relevant to the type of speaking exam that you have chosen.
                            Select the speaker icons to listen to each phrase or expression. This panel also contains two expandable lists of{" "}
                            <strong>Tips</strong>, which provide advice for each type of speaking exam. If you are using the iSpeaker on a smartphone,
                            tap the three horizontal bars in the top left to hide or show these lists.
                        </p>
                        <p>
                            The <strong>Task</strong> section contains instructions for the speaking task shown in the video in the{" "}
                            <strong>Watch</strong> section. It also contains any relevant pictures.
                        </p>
                        <p>
                            In the <strong>Watch</strong> section, you can see a short film of a speaking exam involving the type of task that you
                            have selected.
                        </p>
                        <p>
                            The <strong>Study</strong> section contains a transcript of the video. You can highlight the language that relates to
                            particular functions by checking the relevant boxes in the grey bar at the bottom of this section.
                        </p>
                        <p>
                            In the <strong>Practise</strong> section, you are given instructions for similar tasks. You can{" "}
                            <s>
                                use the <strong>Record</strong> and <strong>Play</strong> buttons to
                            </s>{" "}
                            record and listen to yourself carrying out these tasks. Before you start, you can write notes in the box at the bottom of
                            the <strong>Practise</strong> section.
                        </p>
                        <p>
                            In the <strong>Review</strong> section, you can see the language functions that are relevant to this type of speaking
                            exam, and assess whether or not you have learned to use a range of expressions for each one.
                        </p>
                        <p>
                            <a name="_2_Model_mode"></a>
                            <a href="#_Contents">Back to Help contents</a>
                        </p>
                        <div className="mt-5 mb-5 border-top"></div>
                        <h4 className="fw-semibold mb-4 mt-4">
                            <a name="6_compat"></a>6 Browser Compatibility
                        </h4>
                        <p>Oxford iSpeaker can run on the latest version of the following browsers:</p>
                        <ul>
                            <li>Chromium browsers (Google Chrome, Microsoft Edge, Opera, ...)</li>
                            <li>Firefox</li>
                            <li>Safari (macOS, iOS, iPadOS)</li>
                        </ul>
                        <div className="fw-semibold alert alert-warning" role="alert">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-exclamation-triangle-fill"
                                viewBox="0 0 16 16">
                                {" "}
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                            </svg>{" "}
                            Please note that the record and playback functionality on the iSpeaker is not available on this repository. You can use
                            recording software(s) to record yourself, or{" "}
                            <a href="https://apps.microsoft.com/store/detail/ispeaker-pronunciation-tool/9PNK809K6635">
                                download the Microsoft Store version
                            </a>{" "}
                            on Windows to use it.
                        </div>
                        <p>
                            <a name="_2_Model_mode"></a>
                            <a href="#_Contents">Back to Help contents</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
