// @flow

import parser from 'react-native-html-parser'
import qs from 'qs'

const config = require('../../config.json')

const resourcesLookup = {}

export async function getResourcesByTag (tags: Array<string>, callback: Function) {
  const tagsKey = tags.join(',')
  if (resourcesLookup[tagsKey]) {
    return callback(null, resourcesLookup[tagsKey])
  }

  const params = {
    tags: tagsKey
  }

  const url = `${config.api.host}/api/route-resources?${qs.stringify(params)}`

  let results
  try {
    const response = await fetch(url)
    results = await response.json()

    results.forEach(result => {
      const doc = new parser.DOMParser().parseFromString(result.description, 'text/html')
      result.parsedNodes = []
      for (let i = 0; i < doc.childNodes.length; i++) {
        const node = doc.childNodes[i]
        if (node.nodeName === 'a') {
          // assume text within link
          let link
          for (let i = 0; i < node.attributes.length; i++) {
            if (node.attributes[i].name === 'href') {
              link = node.attributes[i].value
            }
          }
          result.parsedNodes.push({
            type: 'link',
            link: link ? link : undefined,
            text: node.childNodes[0].data
          })
        } else if(node.nodeName === '#text') {
          result.parsedNodes.push({
            type: 'text',
            text: node.data
          })
        }
      }
    })
  } catch (err) {
    console.log('error occurred while fetching route resources')
    console.error(err)
    return callback(err)
  }

  resourcesLookup[tagsKey] = results
  callback(null, results)
}
