#!/bin/python

import os
import sys
from os import path

def pages():
	from markdown import markdownFromFile
	from markdown.extensions.codehilite import CodeHiliteExtension
	from markdown.extensions.nl2br import Nl2BrExtension
	from markdown.extensions.smarty import SmartyExtension

	codeHilite = CodeHiliteExtension({})
	codeHilite.config['pygments_style'] = ['tango', '']
	codeHilite.config['noclasses'] = [True, '']

	for doc in os.listdir('src'):
		name, ext = path.splitext(doc)
		if ext.lower() == '.md':
			markdownFromFile(input='src/' + doc, output='pages/' + name +'.html', output_format='html5', tab_length=2,
				extensions=[codeHilite, SmartyExtension({}), Nl2BrExtension({})] )


if __name__ == '__main__':
	tasks = sys.argv[1:]
	if(len(tasks) == 0):
		tasks = ['pages'] # Default Tasks

	for task in tasks:
		getattr(sys.modules[__name__], task)()
	#sys.exit('Usage: %s database-name' % sys.argv[0])
