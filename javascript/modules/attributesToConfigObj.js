/**
 * Retrieves all attributes from an an HTMLElement of type dataset (starting with 'data-') with specified 'keyname' and returns a config obj key:value
 * For example, for the following HTMLElement: <tag data-x data-x_prop1="22" data-x_prop2="pictau">
 * the func: getConfigByAtt(tag, 'x') will return the following object:
 *
 * { prop1: "22", prop2: "pictau" }
 *
 * Including the attribute Id with its value: <tag data-x="<attributeIdValue>" data-x_prop1="22" data-x_prop2="pictau">
 * the func: getConfigByAtt(tag, 'x', true) will return the following objetc:
 * {x: attributeIdValue, prop1: "22", prop2: "pictau" }
 *
 *
 */

const getConfigByAtt = (HTMLElement, keyName, includeIdKey) => {
	const datasets = HTMLElement.dataset
	let obj = {}

	// console.log(datasets)

	Object.keys(datasets).forEach((key, index) => {
		const configKey = key.split(`${keyName}`)[1]

		if (configKey) {
			const keyToSet = configKey.split('_')[1]
			obj[keyToSet] = datasets[key] === '' ? false : datasets[key]
		}
	})

	if (includeIdKey) {
		let addIdkey = {}
		addIdkey[keyName] = datasets[keyName]
		obj = { ...obj, ...addIdkey }
	}

	return obj
}

export { getConfigByAtt }
