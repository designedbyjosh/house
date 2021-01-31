import { motion } from 'framer-motion';
import React from 'react';
import { fade } from '../styles/animations/transitions';


/**
 * The about page has a bit more information about me.
 * 
 * @author Josh <code@josh.house>
 */
const About = ({ }: any) => {

  return (
    <motion.div className="about" variants={fade} initial="hide" exit="hide" animate="show">
        <p>
            My name is Josh and I'm an Australian engineer. You've stumbled across my blog (look at you!) which is essentially my dumping ground for articles and projects that I get around to doing at home.
        </p>
        <p>
            I'm super passionate about making complex things consumable for everyone and that includes anything from talking about technical things through to designing and developing the interfaces, be it - a website like this one, through to physical buttons - that enable humans to interact with things.
        </p>
        <p>
        I'm a trained systems engineer, which to me, not only means breaking down big problems into actionable chunks, but also means being across lots of different technologies. I've worked on anything from electronics design (C, C++ & Verilog) through to designing web interfaces (TypeScript, React, NodeJS, Angular & NextJS). 
        </p>
        <p>
        I love <a href="https://ohmyz.sh">zsh</a> and I love making a script if it, overall, makes things faster in the long term (Bash, Python & Go). I don't believe there's one superior language that will solve everyone's problems and would prefer to learn a language if it will solve the problem as efficiently, performantly and securely as possible. I believe all technical leaders should still have their hands in code or hardware so in my spare time I regularly tinker away on projects (of which this website is one!) of which a few I've put on <a href="github.com/designedbyjosh">GitHub</a>.
        </p>
        <p>For formalities sake I'm a registered engineer with Engineers Australia (GradIEAust) and a member of the Institute of Electronic and Electrical Engineers (MIEEE). If you want to reach me you can email me <a href="mailto:hello@josh.house">here.</a></p>
      </motion.div>
  );
}

export default About;
