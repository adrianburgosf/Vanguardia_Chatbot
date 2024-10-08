const faceio = new faceIO("fioa1a40");

function enrollNewUser(email, name, onSuccess, onFailure) {
    // Start the facial enrollment process
    faceio.enroll({
        "locale": "auto",
        "enrollIntroTimeout": 5,
        "payload": {
            "name": name,
            "email": email
        }
    }).then(userInfo => {
        // User Successfully Enrolled!
        faceio.restartSession();
        console.log(userInfo);
        onSuccess(userInfo.facialId);

    }).catch(errCode => {
        // handle enrollment failure. Visit:
        // https://faceio.net/integration-guide#error-codes
        // for the list of all possible error codes
        handleError(errCode);
        faceio.restartSession();
        onFailure(errCode);
    })
}
function authenticateUser(callback) {
    setTimeout(() => {
        const cancelButton = document.getElementById("cancelButton");
        cancelButton.style.display = "block"; // Show cancel button
    }, 1000);
    // Authenticate a previously enrolled user
    faceio.authenticate({
        "locale": "auto", // Default user locale
        "idleTimeout": 5
    }).then(userData => {
        console.log("Success, user identified")
        // Grab the facial ID linked to this particular user which will be same
        // for each of his successful future authentication. FACEIO recommend 
        // that your rely on this Facial ID if you plan to uniquely identify 
        // all enrolled users on your backend for example.
        console.log("Linked facial Id: " + userData.facialId)
        // Grab the arbitrary data you have already linked (if any) to this particular user
        // during his enrollment via the payload parameter of the enroll() method.
        console.log("Payload: " + JSON.stringify(userData.payload))
        // {"whoami": 123456, "email": "john.doe@example.com"} set via enroll()
        callback(userData.facialId);
        faceio.restartSession();
    }).catch(errCode => {
        handleError(errCode);
        callback(null, errCode);
        cancelButton.style.display = "none";
        faceio.restartSession();
    })
}

function cancelProcess() {
    faceio.restartSession();
    window.location.href = "/login";
}
function handleError(errCode) {
    // Log all possible error codes during user interaction..
    // Refer to: https://faceio.net/integration-guide#error-codes
    // for a detailed overview when these errors are triggered.
    switch (errCode) {
        case fioErrCode.PERMISSION_REFUSED:
            console.log("Access to the Camera stream was denied by the end user");
            break;
        case fioErrCode.NO_FACES_DETECTED:
            console.log("No faces were detected during the enroll or authentication process");
            break;
        case fioErrCode.UNRECOGNIZED_FACE:
            console.log("Unrecognized face on this application's Facial Index");
            break;
        case fioErrCode.MANY_FACES:
            console.log("Two or more faces were detected during the scan process");
            break;
        case fioErrCode.FACE_DUPLICATION:
            console.log("User enrolled previously (facial features already recorded). Cannot enroll again!");
            break;
        case fioErrCode.MINORS_NOT_ALLOWED:
            console.log("Minors are not allowed to enroll on this application!");
            break;
        case fioErrCode.PAD_ATTACK:
            console.log("Presentation (Spoof) Attack (PAD) detected during the scan process");
            break;
        case fioErrCode.FACE_MISMATCH:
            console.log("Calculated Facial Vectors of the user being enrolled do not matches");
            break;
        case fioErrCode.WRONG_PIN_CODE:
            console.log("Wrong PIN code supplied by the user being authenticated");
            break;
        case fioErrCode.PROCESSING_ERR:
            console.log("Server side error");
            break;
        case fioErrCode.UNAUTHORIZED:
            console.log("Your application is not allowed to perform the requested operation (eg. Invalid ID, Blocked, Paused, etc.). Refer to the FACEIO Console for additional information");
            break;
        case fioErrCode.TERMS_NOT_ACCEPTED:
            console.log("Terms & Conditions set out by FACEIO/host application rejected by the end user");
            break;
        case fioErrCode.UI_NOT_READY:
            console.log("The FACEIO Widget could not be (or is being) injected onto the client DOM");
            break;
        case fioErrCode.SESSION_EXPIRED:
            console.log("Client session expired. The first promise was already fulfilled but the host application failed to act accordingly");
            break;
        case fioErrCode.TIMEOUT:
            console.log("Ongoing operation timed out (eg, Camera access permission, ToS accept delay, Face not yet detected, Server Reply, etc.)");
            break;
        case fioErrCode.TOO_MANY_REQUESTS:
            console.log("Widget instantiation requests exceeded for freemium applications. Does not apply for upgraded applications");
            break;
        case fioErrCode.EMPTY_ORIGIN:
            console.log("Origin or Referer HTTP request header is empty or missing");
            break;
        case fioErrCode.FORBIDDDEN_ORIGIN:
            console.log("Domain origin is forbidden from instantiating fio.js");
            break;
        case fioErrCode.FORBIDDDEN_COUNTRY:
            console.log("Country ISO-3166-1 Code is forbidden from instantiating fio.js");
            break;
        case fioErrCode.SESSION_IN_PROGRESS:
            console.log("Another authentication or enrollment session is in progress");
            break;
        case fioErrCode.NETWORK_IO:
        default:
            console.log("Error while establishing network connection with the target FACEIO processing node");
            break;
    }
}
