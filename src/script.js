let primaryAudio;
let secondaryAudio;
let audioOutput = [];
let primaryDeviceId = 'default';
let secondaryDeviceId = 'default';
let pid;


document.getElementById('close').addEventListener('click', window.ipcRenderer.closeWindow);
document.getElementById('minimize').addEventListener('click', window.ipcRenderer.minimizeWindow);
document.getElementById('maximize').addEventListener('click', window.ipcRenderer.maximizeWindow);

navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
        const outputDevices = devices.filter((device) => device.kind === 'audiooutput');
        let output1 = document.getElementById('output-1')
        let output2 = document.getElementById('output-2')
        outputDevices.forEach((device) => {
            output1.add(new Option(device.label))
            output2.add(new Option(device.label))
            audioOutput.push([device.deviceId, device.label])
        });
    })
    .catch((err) => {
        console.log(`${err.name}: ${err.message}`);
    })

document.getElementById('output-1').addEventListener('change', () => {
    audioOutput.forEach((device) => {
        if (device[1] === event.target.value) {
            primaryDeviceId = device[0];
        }
    })
})

document.getElementById('output-2').addEventListener('change', () => {
    audioOutput.forEach((device) => {
        if (device[1] === event.target.value) {
            secondaryDeviceId = device[0];
        }
    })
})

async function pauseAudio() {
    if (primaryAudio && !primaryAudio.paused) {
        primaryAudio.pause();
        primaryAudio.currentTime = 0;

        if (secondaryAudio && !secondaryAudio.paused) {
            secondaryAudio.pause();
            secondaryAudio.currentTime = 0;
        }
    }
}

async function playAudio(src, playingID) {
    if ((primaryAudio || secondaryAudio) && (!primaryAudio.paused || !secondaryAudio.paused)) {
        if (playingID === pid) {
            pauseAudio();
        }
        else {
            await primaryAudio.setSinkId(primaryDeviceId)
            primaryAudio.src = src;
            secondaryAudio = primaryAudio.cloneNode()
            await secondaryAudio.setSinkId(secondaryDeviceId)
            if (primaryDeviceId === secondaryDeviceId) {
                primaryAudio.play();
            }
            else {
                Promise.all([primaryAudio.play(), secondaryAudio.play()])
            }
            pid = playingID;
        }

    }
    else {
        primaryAudio = new Audio();
        await primaryAudio.setSinkId(primaryDeviceId)
        primaryAudio.src = src;
        secondaryAudio = primaryAudio.cloneNode()
        await secondaryAudio.setSinkId(secondaryDeviceId)
        if (primaryDeviceId === secondaryDeviceId) {
            primaryAudio.play();
        } else {
            Promise.all([primaryAudio.play(), secondaryAudio.play()])
        }
        pid = playingID;
    }
}

function addAudio(dir) {
    let divs = document.querySelectorAll('.button');
    divs.forEach(el => el.addEventListener('click', event => {
        playAudio(dir + '\\' + event.target.innerText, event.target.innerText);
    }))
}

let output = document.getElementsByClassName('folder')
document.getElementById('openDialog').addEventListener('click', () => {
    window.ipcRenderer.getDir()
        .then((data) => {
            let { dir, files } = data;
            if (data['status'] === 'error') {
                alert('Error: Unable to perform operation')
            } else if (data['status'] === 'canceled') {
                alert('Folder selection canceled')
            } else if (files['status'] === 'empty') {
                alert('No sound files in selected directory, Make sure the directory sound files are of mp3 format')
            } else {
                document.getElementById('voices-container').innerHTML = '';
                files.forEach(file => {
                    let x = document.getElementById("voices-container");
                    let element = document.createElement("div");
                    element.className = "button";
                    element.innerText = file;
                    x.appendChild(element);
                });
                addAudio(dir);
            }
        })
})