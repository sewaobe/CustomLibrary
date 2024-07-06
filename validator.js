console.log("Connect Library Success");
function Validator(formSelector, options) {
    var formElement = document.querySelector(formSelector);
    var formRules = {};
    var formData = {};
    var __this = this;

    //Get parent and error elements in input error
    function getErrorElement(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.querySelector(selector))
                return {
                    parentElement: element.parentElement,
                    errorElement: element.parentElement.querySelector(selector),
                };
            element = element.parentElement;
        }
    }

    //Custom function submit
    function handleSubmit(formElement, inputs) {
        formElement.onsubmit = e => {
            var isValid = true;

            e.preventDefault();
            for (var input of inputs) {
                switch (input.type) {
                    case 'radio':
                        input.checked ? (formData[input.id] = input.value) : 'No checked';

                        break;
                    case 'checkbox':
                        input.checked
                            ? Array.isArray(formData[input.id])
                                ? formData[input.id].push(input.value)
                                : (formData[input.id] = [input.value])
                            : 'No checked';
                        break;
                    default:
                        // Get value input text
                        formData[input.id] = input.value;

                        break;
                }
                if (!handleInputBlur(input)) {
                    isValid = false;
                }
            }

            if (isValid) {

                if(options.toastMessage){
                toastMessage(
                    options.toastMessage.idToastSelector,
                    options.toastMessage.classToastSelector,
                    options.toastMessage.contentToastSelector
                );
            }
                __this.onSubmit(formData);
            }
        };
    }

    //function validatorRules => Defined rules for validation.
    var validatorRules = {
        required: function (message = 'The field is required') {
            return function (value) {
                return value ? undefined : message;
            };
        },

        email: function (message = 'Please enter a valid email address') {
            return function (value) {
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})/;
                return regex.test(value) ? undefined : message;
            };
        },
        password: function (min) {
            return function (message = `Please enter a valid password minimum length ${min}`) {
                return function (value) {
                    return value.length > min ? undefined : message;
                };
            };
        },
    };

    //function checked any input has error messages.
    var handleInputBlur = e => {
        var input = e.target ? e.target : e;

        var errorMessage;
        var { parentElement, errorElement } = getErrorElement(input, options.errorElement);
        switch (input.type) {
            case 'radio':
                // Get value input text => Has: set value / No has: Set error message.
                parentElement.querySelectorAll('input[type="radio"]:checked').length !== 0
                    ? 'Checked'
                    : (errorMessage = 'Please select a query type');

                if (input.checked) {
                    for (var ip of Array.from(
                        parentElement.querySelectorAll('input[type="radio"]')
                    )) {
                        if (ip.parentElement.classList.contains('isChecked')) {
                            ip.parentElement.classList.remove('isChecked');
                        }
                    }

                    input.parentElement.classList.add('isChecked');
                }
                break;
            case 'checkbox':
                parentElement.querySelectorAll('input[type="checkbox"]:checked').length !== 0
                    ? 'Checked'
                    : (errorMessage = 'To submit this form, please consent to being contacted');
                break;
            default:
                break;
        }

        //Check invalid first => break && display error message
        for (var validType of formRules[input.id]) {
            if (errorMessage) break;

            errorMessage = validType(input.value);
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            parentElement.classList.add('inValid');
        } else {
            errorElement.innerText = '';
            parentElement.classList.remove('inValid');
        }
        return !errorMessage;
    };

    var handleInput = function (e) {
        var { parentElement, errorElement } = getErrorElement(e.target, options.errorElement);

        if (parentElement.classList.contains('inValid')) {
            errorElement.innerText = '';
            parentElement.classList.remove('inValid');
        }
    };

    // has formElement
    if (formElement) {
        var inputs = formElement.querySelectorAll('[id][rules]');

        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            //Add validator of input to formRules.
            for (var rule of rules) {
                var ruleField = undefined,
                    ruleLength = undefined,
                    ruleMessage = undefined;
                //Check rules validation type max(length) or min(length)
                if (rule.includes('(')) {
                    ruleField = rule.split('(')[0];

                    ruleLength = rule.split('(')[1].substring(0, rule.split('(')[1].indexOf(')'));

                    //Has message error
                    if (rule.includes(':')) {
                        ruleMessage = rule.split(':{')[1].replace('}', '');
                    }
                } else {
                    //Check rules validation type : {Error message}
                    if (rule.includes(':')) {
                        ruleField = rule.split(':{')[0];
                        ruleMessage = rule.split(':{')[1].replace('}', '');
                    }
                }
                var ruleValue;
                if (!ruleField) ruleValue = validatorRules[rule]();
                else {
                    if (ruleLength) {
                        if (ruleMessage)
                            ruleValue = validatorRules[ruleField](ruleLength)(ruleMessage);
                        else ruleValue = validatorRules[ruleField](ruleLength)();
                    } else {
                        if (ruleMessage) ruleValue = validatorRules[ruleField](ruleMessage);
                        else ruleValue = validatorRules[ruleField]();
                    }
                }
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.id].push(ruleValue);
                } else {
                    formRules[input.id] = [ruleValue];
                }
            }
            //Event onblur => Check errors messages!
            input.onblur = handleInputBlur;

            //Event onInput => Remove validation
            input.oninput = handleInput;
        }

        //submit form
        handleSubmit(formElement, inputs);
    }
}

function toastMessage(idToastSelector, classToastSelector, contentToastSelector) {
    const toast = document.querySelector(idToastSelector);
    if (toast) {
        const toastMessage = document.createElement('div');
        for (var toastPre of toast.querySelectorAll('.toastMessageSuccess')) {
            toast.removeChild(toastPre);
        }
        toastMessage.classList.add(classToastSelector);

        toastMessage.innerHTML = contentToastSelector;

        toast.appendChild(toastMessage);
    }
}
