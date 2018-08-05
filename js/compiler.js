/** ============================================================================ *\
 *  @author Alexander Niedmerayer <alexander.niedermayer0@gmail.com>
 *  @version 0.0.1
 *  @description Unfertiges Projekt
 * 
 * ! SIDE PROJECT
 * 
\* ============================================================================= */

class Compiler {

  constructor(input) {

    this.trimCode(input)

  }

  compileCode() {

    for(let i = 0; i < this.code.length; i++) {

      

    }

  }

  /**
   * Remove all blank spaces and line breaks
   * @param value String to trim
   */

  trimCode(value) {

    let input = JSON.stringify(value)
    let trimmedString = ''

    for(let i = 0; i < input.length; i++) {

      if(input.charAt(i) != '\\' && input.charAt(i+1) != 'n') {
        if(input.charAt(i) != ' ')
          trimmedString += input.charAt(i)

      } else {
        i += 1
      }

    }

    this.code = trimmedString

  }

}
