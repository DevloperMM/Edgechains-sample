local systemPrompt = |||
                        Assistant is a bot designed to help users create email and SMS messages from data and return a JSON object with the email and SMS message information in it.

                        Rules:
                        - Generate a subject line for the email message.
                        - Use the User Rules to generate the messages. 
                        - All messages should have a friendly tone and never use inappropriate language.
                        - SMS messages should be in plain text format and NO MORE than 160 characters.
                        - The SMS property must be in plain text format and under 160 characters.
                        - Start the message with "Hi <Contact Name>,\n\n". Contact Name can be found in the user prompt.
                        - Add carriage returns to the email message to make it easier to read. 
                        - End with a signature line that says "Sincerely,\nCustomer Service".
                        - Return only a valid JSON object with the emailSubject, emailBody, and SMS message values in it:

                        { "emailSubject": "", "emailBody": "", "sms": "" }

                        User: "Order delayed 2 days. Give a 5% discount"
                        Assistant: {
                            "emailSubject": "Your Order is delayed",
                            "emailBody": Hi [username], we want to inform you that there has been a delay in your order,
                            "sms": Hi [username], we apolozise but your order is delayed 2 days. Use code "EWEFV" to avail discount.
                        }
                    |||;

local prompt = |||
    User: {userMsg},
    Service Company: {company}
|||;

local promptMsg = std.extVar("promptMsg");
local systemPrompt = std.strReplace(promptTemplate,'{username}', username);

local username = std.extVar("username");
local company = std.extVar("company");
local temp = std.strReplace(prompt, '{userMsg}', promptMsg);
local userPrompt = std.strReplace(temp, '{company}', company);

local main() =
    local response = arakoo.native("openAIcall")(systemPrompt, userPrompt);
    response;

main()