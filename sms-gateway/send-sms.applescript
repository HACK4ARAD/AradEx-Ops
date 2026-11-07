-- T24 · trimite un SMS prin aplicația Mesaje (iPhone-ul cu „Redirecționare mesaje text” spre acest Mac).
-- Folosire: osascript send-sms.applescript "+40744123456" "textul"
-- Argumentele vin separat (nu se lipesc în cod), deci textul nu poate executa nimic.
on run argv
	set targetPhone to item 1 of argv
	set messageText to item 2 of argv
	tell application "Messages"
		set smsService to 1st account whose service type = SMS
		set targetParticipant to participant targetPhone of smsService
		send messageText to targetParticipant
	end tell
end run
