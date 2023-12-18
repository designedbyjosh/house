'use client'
import { useState, useEffect } from 'react';
import { SubscribeToNewsletter } from '@/lib/ghost';
import { CornerDialog, toaster } from 'evergreen-ui';
import isValidEmail from 'is-valid-email';

export default function EmailSignup() {

    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const [emailText, setEmailText] = useState("")
    const [emailLoading, setEmailLoading] = useState(false)
    const valid = isValidEmail(emailText)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedValue = localStorage.getItem('hasSubscribed')
            if (!storedValue) {
                setTimeout(() => { setShowSignupPrompt(true) }, 5000)
            }
        }
    }, [])

    return <CornerDialog width={300} hasClose={false} containerProps={{ className:"dark:bg-neutral-900", style: { border: "3px gray solid", boxShadow: 'none' } }} hasFooter={false} isShown={showSignupPrompt}>
        <h1 
            className="text-2xl">
            Stay in Touch
        </h1>
        <p>
            Would you like to have my writing occasionally sent to your inbox, with absolutely no spam?
        </p>
        <input
            type="text"
            className="outline-none border-2 p-2 mb-2 text-center w-full rounded mt-3"
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
                    .catch(() => toaster.danger("Sorry, it looks like signing you up didn't work out"))
            }}
            style={{ opacity: !valid || emailLoading ? 0.3 : 1 }}
            className="text-sm w-full bg-emerald-100 dark:bg-emerald-700 hover:bg-emerald-900 hover:text-white py-1 px-4 rounded">
            {emailLoading ? "Signing Up" : "Sign Up"}
        </button>
        <button 
            onClick={() => { 
                setShowSignupPrompt(false); 
                localStorage.setItem('hasSubscribed', JSON.stringify(true));
                }} 
            className="text-sm w-full bg-gray-100 dark:bg-neutral-500 hover:bg-gray-900 mt-1 hover:text-white py-1 px-4 rounded">
            No Thanks
        </button>

    </CornerDialog>
}
