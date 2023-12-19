'use client'
import { useState, useEffect } from 'react';
import { SubscribeToNewsletter } from '@/lib/ghost';
import { CornerDialog, toaster } from 'evergreen-ui';
import isValidEmail from 'is-valid-email';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function EmailSignup({ showCancel=true, signupText="Sign Up", header="Stay in Touch", message="Would you like to have my writing occasionally sent to your inbox, with absolutely no spam?", setShowSignupPrompt = () => {} } : { signupText? : string, showCancel? : boolean, header? : string, message? : string, setShowSignupPrompt?: (targetState: boolean) => void}) {

    const [emailText, setEmailText] = useState("")
    const [emailLoading, setEmailLoading] = useState(false)
    const valid = isValidEmail(emailText)

    return <div>
        <h1 
            className="text-2xl">
            {header}
        </h1>
        <p className="text-sm">
            {message}
        </p>
        <input
            type="text"
            className="outline-none text-sm p-2 mb-2 text-center w-full rounded mt-2"
            placeholder="Your Email Address"
            value={emailText}
            onChange={(event) => setEmailText(event.target.value)}
        />
        <button
            disabled={!valid}
            onClick={() => {
                setEmailLoading(true);
                SubscribeToNewsletter(emailText)
                    .then(() => {
                        setEmailLoading(false);
                        setEmailText("");
                        setShowSignupPrompt(false);
                        localStorage.setItem('hasSubscribed', JSON.stringify(true));
                        toaster.success(`Thanks so much. I've subscribed ${emailText} to receive updates on my writing.`);
                    })
                    .catch(() => {setEmailLoading(false); toaster.danger("Sorry, it looks like signing you up didn't work out")})
            }}
            style={{ opacity: !valid || emailLoading ? 0.3 : 1 }}
            className="text-sm w-full bg-emerald-400 hover:bg-emerald-600 hover:text-white py-1 px-4 rounded">
            {emailLoading && <FontAwesomeIcon spin icon={faSpinner} size="sm" />} {signupText}
        </button>
       {showCancel && <button 
            onClick={() => { 
                setShowSignupPrompt(false); 
                localStorage.setItem('hasSubscribed', JSON.stringify(true));
                }} 
            className="text-sm w-full bg-neutral-100 hover:bg-neutral-600 mt-2 hover:text-white py-1 px-4 rounded">
            No Thanks
        </button>}

    </div>
}
