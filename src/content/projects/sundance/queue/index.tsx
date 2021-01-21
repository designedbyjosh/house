import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import './queue.scss';

const Drawing: React.FC = () => {

    return <div />

}

const Queue: React.FC = () => {

  let queue = ["Jake", "Anita", "Matt"];

  return (
    <div className="queue">

    {queue.map((drawing) => <Drawing />)}
   
    </div>

  )

}

export default Queue;