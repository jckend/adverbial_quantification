/* eslint-disable @typescript-eslint/naming-convention */
import jsPsychRdk from '@jspsych-contrib/plugin-rdk'
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'

import { debugging, getUserInfo, mockStore, prolificCC, prolificCUrl } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './lib/databaseUtils'

import type { SaveableDataRecord } from '../types/project'
import type { DataCollection } from 'jspsych'

import imgStimBlue from './images/blue.png'
import imgStimOrange from './images/orange.png'

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

const debug = debugging()
const mock = mockStore()

type Task = 'response' | 'fixation'
type Response = 'left' | 'right'
type KeyboardResponse = 'f' | 'j'

interface TrialData {
  task: Task
  response: Response
  correct: boolean
  correct_response: Response
  saveIncrementally: boolean
}

const debuggingText = debug ? `<br /><br />redirect link : ${prolificCUrl}` : '<br />'
const exitMessage = `<p class="text-center align-middle">
Please wait. You will be redirected back to Prolific in a few moments.
<br /><br />
If not, please use the following completion code to ensure compensation for this study: ${prolificCC}
${debuggingText}
</p>`

const exitExperiment = (): void => {
  document.body.innerHTML = exitMessage
  setTimeout(() => {
    globalThis.location.replace(prolificCUrl)
  }, 3000)
}

const exitExperimentDebugging = (): void => {
  const contentDiv = document.querySelector('#jspsych-content')
  if (contentDiv) contentDiv.innerHTML = exitMessage
}

export async function runExperiment(updateDebugPanel: () => void): Promise<void> {
  if (debug) {
    console.log('--runExperiment--')
    console.log('UserInfo ::', getUserInfo())
  }

  /* initialize jsPsych */
  const jsPsych = initJsPsych({
    on_data_update: function (trialData: TrialData) {
      if (debug) {
        console.log('jsPsych-update :: trialData ::', trialData)
      }
      // if trialData contains a saveIncrementally property, and the property is true, then save the trialData to Firestore immediately (otherwise the data will be saved at the end of the experiment)
      if (trialData.saveIncrementally) {
        saveTrialDataPartial(trialData as unknown as SaveableDataRecord).then(
          () => {
            if (debug) {
              console.log('saveTrialDataPartial: Success') // Success!
              if (mock) {
                updateDebugPanel()
              }
            }
          },
          (error: unknown) => {
            console.error(error) // Error!
          },
        )
      }
    },
    on_finish: (data: DataCollection) => {
      const contentDiv = document.querySelector('#jspsych-content')
      if (contentDiv) contentDiv.innerHTML = '<p> Please wait, your data are being saved.</p>'
      saveTrialDataComplete(data.values()).then(
        () => {
          if (debug) {
            exitExperimentDebugging()
            console.log('saveTrialDataComplete: Success') // Success!
            console.log('jsPsych-finish :: data ::')
            console.log(data)
            setTimeout(() => {
              jsPsych.data.displayData()
            }, 3000)
          } else {
            exitExperiment()
          }
        },
        (error: unknown) => {
          console.error(error) // Error!
          exitExperiment()
        },
      )
    },
  })

  /* create timeline */
  const timeline: Record<string, unknown>[] = []

  /* preload images */
  const preload = {
    type: jsPsychPreload,
    images: [imgStimBlue, imgStimOrange],
  }
  timeline.push(preload)

  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  /* define instructions trial */
  const instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
<p>In this experiment, you will do stuff blah blah blah.</p>
<p>Press any key to begin.</p>
    `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions)

  /* define trial stimuli array for timeline variables */
  const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: 'NO_KEYS',
    trial_duration: function () {
      return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0]
    },
    data: {
      task: 'fixation' satisfies Task,
    },
  }

  var trial1 = {
    type: jsPsychRdk, 
    number_of_apertures: 3, //This needs to be set if more than one aperture
    trial_duration: 10000,
    correct_choice: "a",
    RDK_type: 3, //Applied to all apertures if only one value
    aperture_type: 1,
    move_distance: [0, 1, 1],
    dot_color: ["yellow", "yellow", "blue"],
    aperture_width: 500, //Applied to all apertures if only one value
    number_of_dots: [150, 50, 200], //Different parameter for each aperture. Array length must equal number_of_apertures
    aperture_center_x: [(window.innerWidth/2)-150, (window.innerWidth/2)-150, (window.innerWidth/2)+150] //Separate the apertures on the screen (window.innerWidth/2 is the middle of the screen)
 }

var trial2 = {
    type: jsPsychRdk, 
    number_of_apertures: 3, //This needs to be set if more than one aperture
    trial_duration: 10000,
    correct_choice: "f",
    RDK_type: 3, //Applied to all apertures if only one value
    move_distance: [1, 0, 1],
    dot_color: ["yellow", "yellow", "blue"],
    aperture_width: 200, //Applied to all apertures if only one value
    number_of_dots: [150, 50, 200], //Different parameter for each aperture. Array length must equal number_of_apertures
    aperture_center_x: [(window.innerWidth/2)-150, (window.innerWidth/2)-150, (window.innerWidth/2)+150] //Separate the apertures on the screen (window.innerWidth/2 is the middle of the screen)
 }

  var trial3 = {
    type: jsPsychRdk, 
    number_of_apertures: 3, //This needs to be set if more than one aperture
    trial_duration: 10000,
    correct_choice: "a",
    RDK_type: 3, //Applied to all apertures if only one value
    move_distance: [1, 0.5, 0],
    dot_color: ["yellow", "blue", "blue"],
    aperture_width: 200, //Applied to all apertures if only one value
    number_of_dots: [200, 150, 50], //Different parameter for each aperture. Array length must equal number_of_apertures
    aperture_center_x: [(window.innerWidth/2)-150, (window.innerWidth/2)+150, (window.innerWidth/2)+150] //Separate the apertures on the screen (window.innerWidth/2 is the middle of the screen)
 }

    var trial4 = {
    type: jsPsychRdk, 
    number_of_apertures: 3, //This needs to be set if more than one aperture
    trial_duration: 10000,
    correct_choice: "a",
    RDK_type: 3, //Applied to all apertures if only one value
    move_distance: [0, 1, 1],
    dot_color: ["yellow", "yellow", "blue"],
    aperture_width: 200, //Applied to all apertures if only one value
    number_of_dots: [150, 50, 200], //Different parameter for each aperture. Array length must equal number_of_apertures
    aperture_center_x: [window.innerWidth/2, window.innerWidth/2, window.innerWidth/2] //Separate the apertures on the screen (window.innerWidth/2 is the middle of the screen)
 }

var trial5 = {
    type: jsPsychRdk, 
    number_of_apertures: 3, //This needs to be set if more than one aperture
    trial_duration: 10000,
    correct_choice: "f",
    RDK_type: 3, //Applied to all apertures if only one value
    move_distance: [1, 0, 1],
    dot_color: ["yellow", "yellow", "blue"],
    aperture_width: 200, //Applied to all apertures if only one value
    number_of_dots: [150, 50, 200], //Different parameter for each aperture. Array length must equal number_of_apertures
    aperture_center_x: [window.innerWidth/2, window.innerWidth/2, window.innerWidth/2] //Separate the apertures on the screen (window.innerWidth/2 is the middle of the screen)
 }

  var trial6 = {
    type: jsPsychRdk, 
    number_of_apertures: 3, //This needs to be set if more than one aperture
    trial_duration: 10000,
    correct_choice: "a",
    RDK_type: 3, //Applied to all apertures if only one value
    move_distance: [1, 0.5, 0],
    dot_color: ["yellow", "blue", "blue"],
    aperture_width: 200, //Applied to all apertures if only one value
    number_of_dots: [200, 150, 50], //Different parameter for each aperture. Array length must equal number_of_apertures
    aperture_center_x: [window.innerWidth/2, window.innerWidth/2, window.innerWidth/2] //Separate the apertures on the screen (window.innerWidth/2 is the middle of the screen)
 }

    const blue_always = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>The blue dots always move.</p>
    `,
    post_trial_gap: 2000,
  }

  const yellow_usually = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>The yellow dots usually move.</p>
    `,
    post_trial_gap: 2000,
  }

      const blue_usually = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>The blue dots usually move.</p>
    `,
    post_trial_gap: 2000,
  }

  const blue_often = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>The blue dots move more often than not.</p>
    `,
    post_trial_gap: 2000,
  }


  const test_procedure = {
    timeline: [fixation, blue_always, trial1, fixation, yellow_usually, trial2, fixation, blue_always, trial3, fixation, blue_usually, trial4, fixation, blue_often, trial5, fixation, blue_usually, trial6],
    repetitions: 1,
    randomize_order: true,
  }
  timeline.push(test_procedure)



  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
