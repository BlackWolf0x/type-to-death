export interface Chapter {
    text: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface Story {
    title: string;
    introduction: string;
    chapters: Chapter[];
}

export const story: Story = {
    title: "The Archivist's Descent",
    introduction: "Some places remember. The Blackwood Municipal Archives had stood for ninety-seven years, a monument to bureaucratic tedium and forgotten paperwork. But in its lowest level, behind a door marked only with faded numbers, something far older than city records waited in the darkness.\n\nWhen junior archivist Emma Chen received the assignment to catalog the restricted basement collection, she thought it would be routine work. A week alone among dusty files, perhaps uncovering some mildly interesting historical scandal. She had no way of knowing that some documents were restricted not to protect the living, but to protect them from what lay written in ink that seemed to move when you weren't looking directly at it.\n\nThe elevator descended with a grinding metallic shriek. Emma carried only her laptop, a thermos of coffee, and the key that had been pressed into her hand by the head archivist, whose trembling fingers and haunted expression she had attributed to old age. She would understand soon enough.",
    chapters: [
        {
            text: "The basement was cold and smelled like old paper. Emma found the light switch and heard it click. Nothing happened. She used her phone light to see.",
            difficulty: "easy"
        },
        {
            text: "Rows of metal shelves stretched into darkness. Each one held boxes with strange labels. Some were written in languages she did not recognize. Her footsteps echoed too long.",
            difficulty: "easy"
        },
        {
            text: "She opened the first box on the nearest shelf. Inside were journals bound in leather. One fell open to a page covered in frantic handwriting that simply repeated help us over and over.",
            difficulty: "easy"
        },
        {
            text: "Emma closed that box quickly and moved deeper into the archive. Her phone battery dropped from sixty percent to twenty in seconds. The temperature fell with each step she took forward.",
            difficulty: "easy"
        },
        {
            text: "Box 1847-C contained photographs that should not exist; images of the building's construction showed workers staring directly at the camera with expressions of absolute terror, their mouths open in silent screams. The date on the back read 1876, decades before photography could capture motion.",
            difficulty: "medium"
        },
        {
            text: "Her laptop began typing on its own. Words appeared across her screen: 'You should not have come here. The collection is incomplete. We need one more.' Emma's hands shook as she tried to close the document, but the keyboard would not respond to her commands anymore.",
            difficulty: "medium"
        },
        {
            text: "The shelves behind her had rearranged themselves while she worked. The exit was gone, replaced by endless corridors of filing cabinets that seemed to breathe. From somewhere in the darkness came the sound of papers shuffling, though she could see no movement; thousands of pages turning in perfect unison.",
            difficulty: "medium"
        },
        {
            text: "She found personnel files for employees who had worked in this basement. Every single file ended the same way: 'Transferred to permanent collection, 3:00 AM.' The last entry was dated yesterday. Emma checked her watch and felt ice flood her veins when she saw it was 2:47 AM, though she had entered at noon.",
            difficulty: "medium"
        },
        {
            text: "The archive's true nature revealed itself in Box 0000-A, a container that predated the building by centuries. Inside lay a manuscript written in still-wet ink, documenting events that had not yet occurred but described Emma's arrival with disturbing accuracy. The final pages were blank, waiting. She realized with mounting horror that she was not here to catalog the collection; she was here to complete it, to become the 1,847th volume in an anthology of souls bound in flesh and filed in darkness.",
            difficulty: "hard"
        },
        {
            text: "At precisely 2:58 AM, the lights flickered on throughout the basement, revealing what the darkness had hidden: every box, every shelf, every cabinet contained a person trapped in frozen agony, their bodies compressed into rectangular shapes and labeled with acquisition dates spanning back to 1743. They were alive, she realized, watching her through eyes that could not blink, screaming through mouths that could not open. The collection was not documents at all but a library of human suffering, and the head archivist's trembling had been a warning she had failed to understand.",
            difficulty: "hard"
        },
        {
            text: "Emma ran toward where the exit had been, but the archive reconfigured itself faster than she could navigate. Walls of filing cabinets slid into new positions, creating a maze that tightened around her like a closing fist. Her laptop had transformed into something else entirely: its screen now displayed an intake form requesting her name, date of birth, and preferred storage location (Subsection D, Shelf 94, Position 1847-D had already been selected). The keyboard keys had become small grasping fingers that reached for her hands, eager to pull her into the machine's digital maw.",
            difficulty: "hard"
        },
        {
            text: "At 3:00 AM exactly, Emma Chen ceased to exist as anything recognizable. The archive accepted its newest acquisition with the mechanical efficiency of a system that had perfected this process over 282 years and 1,846 previous subjects. By morning, the head archivist would file the paperwork listing her as 'transferred to another department,' and by afternoon, a new junior archivist named Michael Torres would receive an assignment to catalog the restricted basement collection. The Blackwood Municipal Archives had stood for ninety-seven years, but what dwelled in its lowest level had been collecting long before the building was even conceived, and it would continue collecting long after the structure crumbled to dust. Some places do not just remember; they hunger, they catalog, and they are never, ever full.",
            difficulty: "hard"
        }
    ]
};

// Legacy export for backward compatibility
export const typingChallenges = story.chapters;
