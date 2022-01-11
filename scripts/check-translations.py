#!/usr/bin/python3
from lxml import etree

failed = False

NS = '{urn:oasis:names:tc:xliff:document:1.2}'

sources = etree.parse('translations/messages.xlf')
targets = etree.parse('translations/messages.fr.xlf')

for source_tu in sources.findall('.//%strans-unit' % NS):
    target_tu = targets.findall('.//%strans-unit[@id="%s"]' % (NS, source_tu.attrib['id']))
    if len(target_tu) > 1:
        failed = True
        print('ERROR: More than one trans-unit with ID %s, please keep only one in messages.fr.xlf' % source_tu.attrib['id'])
        continue
    if len(target_tu) == 0:
        failed = True
        print('ERROR: Missing trans-unit with ID %s, please add it to messages.fr.xlf' % source_tu.attrib['id'])
        continue

    target_tu = target_tu[0]
    if len(target_tu) != 2:
        failed = True
        print('ERROR: Trans-unit with ID %s does not have exactly two child (one <source> and one <target>) in messages.fr.xlf' % source_tu.attrib['id'])
        continue
    if target_tu[0].tag != ('%ssource' % NS):
        failed = True
        print('ERROR: Trans-unit with ID %s does not have <source> as its first child in messages.fr.xlf' % source_tu.attrib['id'])
        continue
    if target_tu[1].tag != ('%starget' % NS):
        failed = True
        print('ERROR: Trans-unit with ID %s does not have <target> as its second child in messages.fr.xlf' % source_tu.attrib['id'])
        continue
    if target_tu[0].text != source_tu[0].text:
        failed = True
        print('ERROR: Trans-unit with ID %s has a different <source> than in message.xlf! Changes to the english text should be made in the source code only.'  % source_tu.attrib['id'])
        continue

for target_tu in targets.findall('.//%strans-unit' % NS):
    source_tu = sources.findall('.//%strans-unit[@id="%s"]' % (NS, target_tu.attrib['id']))
    if len(source_tu) == 0:
        failed = True
        print('ERROR: Superfluous trans-unit with ID %s, please remove it from messages.fr.xlf' % target_tu.attrib['id'])
        continue

if failed:
    exit(1)
