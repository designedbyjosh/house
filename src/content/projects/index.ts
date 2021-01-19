import sundance from './sundance';

export const projects = {
    [sundance.metadata.id]: sundance
} as Projects;

export const idToProject = (id: string): Article => projects[id];

