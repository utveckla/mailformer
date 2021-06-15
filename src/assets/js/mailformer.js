let inputIds = [];
const templateSelector = document.querySelector("#template-selector");
const templateArea = document.querySelector("#template-area");
const formArea = document.querySelector("#form-area");

const pad2 = (n) => {
    return n < 10 ? '0' + n : n;
};

const getTimeStamp = () => {
    const date = new Date();

    timestamp = (date.getFullYear().toString().substring(2) +
        pad2(date.getMonth() + 1) +
        pad2(date.getDate()) +
        pad2(date.getHours()) +
        pad2(date.getMinutes()) +
        pad2(date.getMilliseconds()) +
        pad2(date.getSeconds()));

    return timestamp;
};

const updateTemplate = (inputElement) => {
    const inputValue = inputElement.value;
    const targetAudience = inputElement.dataset.target;

    document.querySelectorAll(`[data-id*="${targetAudience}"]`).forEach((elem) => {
        switch (elem.nodeName) {
            case "SPAN":
                elem.innerHTML = inputValue;
                break;
            case "A":
                elem.href = inputValue;
                break;
            case "IMG":
                elem.src = inputValue;
                break;
            default:
                console.warn("Unsupported editable element detected.");
        }
    });
};

// eslint-disable-next-line
const changeMailTemplate = (selectedTemplate) => {
    if (selectedTemplate !== "") {
        const request = new XMLHttpRequest();
        request.open("GET", `assets/html/mail-templates/${selectedTemplate}.html?t=${getTimeStamp()}`, true);

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                const resp = request.responseText;
                formArea.innerHTML = "";
                inputIds = [];

                templateArea.innerHTML = resp;
                generateMailForm();
            }
        };

        request.send();
    } else {
        while (templateArea.firstChild) {
            templateArea.removeChild(templateArea.firstChild);
        }
    }
};

const downloadEmailTemplate = () => {
    const link = document.createElement("a");
    const mailTemplate = templateSelector.options[templateSelector.selectedIndex].value;
    const templateFormat = document.querySelector('input[name=templateFormat]:checked').value;
    let subject = "";
    let recipients = "";
    let bcc = "";
    let mainRecipients = "test@notanemail.test1";

    switch (mailTemplate) {
        case "poc":
            subject = "The royal e-mail subject";
            recipients = mainRecipients;
            break;
        default:
            console.warn("Remember to select a template?");
    }

    let elHtml = "";
    if (templateFormat === "eml") {
        elHtml += `Subject: ${subject}\n`;
        elHtml += "X-Unsent: 1\n";
        elHtml += "X-Uniform-Type-Identifier: com.apple.mail-draft\n";
        elHtml += `TO: ${recipients}\n`;
        elHtml += `BCC: ${bcc}\n`;
        elHtml += "Content-Type: text/html; charset=utf-8\n";
    }
    elHtml += "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n";
    elHtml += "<head>\n";
    elHtml += document.querySelector("#template-styles").innerHTML;
    elHtml += "</head>\n";
    elHtml += "<body>\n";
    elHtml += document.querySelector("#template-body").innerHTML;
    elHtml += "</body>\n";
    elHtml += "</html>";

    link.setAttribute("download", `date-${mailTemplate}.${templateFormat === "eml" ? "eml" : "html"}`);
    link.setAttribute("href", `data:text/html;charset=utf-8,${encodeURIComponent(elHtml)}`);
    link.click();
};

const getListOptions = (elementId) => {
    const listOptions = window.lists[elementId];
    let optionsHTML;

    if (typeof listOptions === "undefined") {
        alert("You forgot to add a list called: " + elementId + "to ./assets/lists.js");
        return;
    }

    listOptions.forEach((option) => {
        optionsHTML += `<option value="${option}">${option}</option>`;
    });

    return optionsHTML;
};

document.querySelector("#download-email-template").onclick = () => {
    downloadEmailTemplate();
};

const generateMailForm = () => {
    document.querySelectorAll("#template-area .editable").forEach((elem, i) => {
        const elementId = elem.dataset.id;

        if (inputIds.includes(elementId)) {
            return;
        }

        const elementTitle = elem.dataset.title || "";
        const elementType = elem.dataset.type || "";
        const elementDefaultValue = elem.dataset.default || "";
        let elementInputHTML = "";

        inputIds.push(elementId);

        switch (elementType) {
            case "input":
                elementInputHTML = `<input data-target="${elementId}" id="form-input-${i}" type="text" class="form-control" value="${elementDefaultValue}">`;
                break;
            case "url":
                elementInputHTML = `<input data-target="${elementId}" id="form-input-${i}" type="text" class="form-control" value="${elem.href}">`;
                break;
            case "image":
                elementInputHTML = `<input data-target="${elementId}" id="form-input-${i}" type="text" class="form-control" value="${elem.src}">`;
                break;
            case "text":
                elementInputHTML = `<textarea data-target="${elementId}" id="form-input-${i}" rows="4" cols="50" class="form-control">${elementDefaultValue}</textarea>`;
                break;
            case "number":
                elementInputHTML = `<input data-target="${elementId}" id="form-input-${i}" type="number" class="form-control" value="${elementDefaultValue}">`;
                break;
            case "date":
                elementInputHTML = `<input data-target="${elementId}" id="form-input-${i}" type="date" class="form-control" value="${elementDefaultValue}">`;
                break;
            case "list":
                elementInputHTML = `<select data-target="${elementId}" id="form-input-${i}" class="form-control">${getListOptions(elementId)}</select>`;
                break;
            default:
                console.warn("Unsupported editable element detected.");
        }

        const elementHTMLString = `<div class="mb-3">
				<label for="form-input-${i}" class="form-label">${elementTitle}</label>
				${elementInputHTML}
			</div>`;

        const elementHTML = new DOMParser().parseFromString(elementHTMLString, "text/html");

        const elementFirstChild = elementHTML.body.firstChild.querySelector(".form-control");

        elementFirstChild.onclick = () => {
            updateTemplate(elementFirstChild, elem);
        };

        elementFirstChild.onkeyup = () => {
            updateTemplate(elementFirstChild, elem);
        };

        elementFirstChild.onchange = () => {
            updateTemplate(elementFirstChild, elem);
        };

        formArea.appendChild(elementHTML.body.firstChild);

        updateTemplate(elementFirstChild, elem);
    });
};
