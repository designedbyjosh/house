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
    <motion.div className="about" variants={fade} initial="hidden" exit="hidden" animate="show">
        <img src="https://josh-house.s3-ap-southeast-2.amazonaws.com/me.jpg" style={{width: '100%'}}/>
        <h3>
          What is this?
        </h3>
        <p>
            My name is Josh and I'm an Australian engineer. You've stumbled across my blog (look at you!) which is my stomping ground of past and present projects and a few articles I get around to when I'm at home.
        </p>
        <h3>
          What are you all about?
        </h3>
        <p>
            Well, I'm super passionate about making complex things consumable for everyone. That includes anything from talking about technical things through to designing and developing interfaces for physical and virtual systems. That could be a website <a target="_blank" href="https://github.com/designedbyjosh/house">like this one</a>, through to an embedded system like <a target="_blank" href="https://github.com/designedbyjosh/wamon">a HomeKit enabled watering system </a>. My dumbest idea has been turning my wall into <a target="_blank" href="https://github.com/designedbyjosh/sundance">an open canvas rented out through donations to charity</a>.  
        </p>
        <h3>
          Why did you pick this path?
        </h3>
        <p>
        In University, I studied systems engineering, which to me, means breaking down big problems into actionable chunks. It also means a lot more, such as being across lots of different technologies. In the past, I've worked on anything from electronics design (C, C++ & Verilog) through to designing web interfaces (TypeScript, React, NodeJS, Angular & NextJS). And by a combination of fate and luck, I've realised that underneath everything I've loved doing, it's making things that people love to use, be it hardware, software or even something mechanical.
        </p>
        <h3>
          So you like software?
        </h3>
        <p>
         Especially when it's 2AM in the morning and the world around you is silent except for <a target="_blank" href="https://www.youtube.com/watch/5qap5aO4i9A">some LoFi beats</a>. I studied Computer Science at University and was oddly obsessed with Ada and Haskell, although my focus has certainly shifted to more modern languages. I reckon Docker is awesome, and have run a few Kubernetes stacks in my time to serve anything from an OpenLDAP deployment that ran my house with SSO through to an old variant of this blog back in the day. 
        </p>
        <p>
        I love <a target="_blank" href="https://ohmyz.sh">zsh</a> and I love making a script if it, overall, makes things faster in the long term (Bash, Python & Go). I don't believe there's one superior language that will solve everyone's problems. And I would definitely prefer to learn a new language if it will solve the problem more efficiently, performantly and securely. I believe all technical leaders should have their hands in code or hardware (or their technical speciality) so in my spare time I regularly tinker away on projects, and when I get a chance, put them on <a target="_blank" href="github.com/designedbyjosh">GitHub</a>. I'm a member of the Australian Computer Society (ACS).
        </p>
        <h3>
          But, hardware too?
        </h3>
        <p>Yeah! I studied Mechatronics Systems Engineering, which is lots of mathematics such as localising robots in unknown environments (SLAM) or designing industrial automation solutions. I'm a registered engineer with Engineers Australia (GradIEAust) and a member of the Institute of Electronic and Electrical Engineers (MIEEE).</p>
      </motion.div>
  );
}

export default About;
