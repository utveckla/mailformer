let inputIds = [];
const templateSelector = document.querySelector("#template-selector");
const templateArea = document.querySelector("#template-area");
const formArea = document.querySelector("#form-area");

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
        request.open("GET", `assets/html/mail-templates/${selectedTemplate}.html`, true);

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                const resp = request.responseText;

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

    let elHtml = `Subject: ${subject}\n`;
    elHtml += "X-Unsent: 1\n";
    elHtml += `TO: ${recipients}\n`;
    elHtml += `BCC: ${bcc}\n`;
    elHtml += "Content-Type: text/html; charset=utf-8\n";
    elHtml += "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n";
    elHtml += "<head>\n";
    elHtml += document.querySelector("#template-area").innerHTML;
    elHtml += "</body></html>";

    link.setAttribute("download", `date-${mailTemplate}.eml`);
    link.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(elHtml)}`);
    link.click();
};

document.querySelector("#download-email-template").onclick = () => {
    downloadEmailTemplate();
};

const generateMailForm = () => {
    formArea.innerHTML = "";

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
            case "date":
                elementInputHTML = `<input data-target="${elementId}" id="form-input-${i}" type="date" class="form-control" value="${elementDefaultValue}">`;
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

        document.querySelector("#form-area").appendChild(elementHTML.body.firstChild);
    });
};