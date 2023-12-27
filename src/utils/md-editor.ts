import {codeLive, divider, fullscreen, hr, ICommand, image, strikethrough, title} from "@uiw/react-md-editor";

export const excludeCommands = [
    codeLive.name, fullscreen.name, title.name, image.name, hr.name, strikethrough.name, divider.name
]

export const commandsFilter = (command: ICommand): false | ICommand => {
    if (excludeCommands.includes(command.name) || !excludeCommands.includes(command.groupName)) {
        return false
    }

    return command
}
