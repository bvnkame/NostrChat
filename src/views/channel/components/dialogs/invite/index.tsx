import React, { useEffect } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import CloseModal from 'components/close-modal';
import CopyToClipboard from 'components/copy-clipboard';
import useModal from 'hooks/use-modal';
import useTranslation from 'hooks/use-translation';
import IconButton from '@mui/material/IconButton';
import ContentCopy from 'svg/content-copy';
import {Channel, RelayDict} from 'types';
import QRCode from 'react-qr-code';
import { nip19 } from 'nostr-tools';
import { getRelays } from 'local-storage';


const Invite = (props: { channel: Channel }) => {
    const [nevent, setNevent] = React.useState('');
    const [url, setUrl] = React.useState('');

    useEffect(() => {
        getRelays().then((relayDict : RelayDict) => {
            const eventID = channel.id;
            let relayArray = relayDict ? Object.keys(relayDict) : [];
            console.log('Got relays', relayArray);

            relayArray = ['wss://nostream.breadslice.com', 'wss://relay.damus.io', 'wss://relay1.nostrchat.io']

            const event = { id: eventID, kind: 40, relays: relayArray };

            let groupNEvent = nip19.neventEncode(event);
            console.log('Generated nevent', groupNEvent);
            let groupUrl = `${window.location.protocol}//${window.location.host}/channel/${eventID}`;

            setNevent(groupNEvent);
            setUrl(groupUrl);
        });
    }, [])

    const {channel} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();

    const handleClose = () => {
        showModal(null);
    };

    

    return (
        <>
            <DialogTitle>{t('Invite People')}<CloseModal onClick={handleClose}/></DialogTitle>
            <DialogContent>
                <Box sx={{pt: '10px'}}>
                    <TextField
                        label="Invitation Link"
                        value={url}
                        fullWidth
                        InputProps={{
                            endAdornment: <InputAdornment position="end">
                                <CopyToClipboard copy={url}>
                                    <IconButton><ContentCopy height={18}/></IconButton>
                                </CopyToClipboard>
                            </InputAdornment>,
                        }}
                    />

                    {/* <p>{JSON.stringify(event)}</p> */}
                    <p>QR Code:</p>
                    <Box sx={{
                        justifyContent: 'center',
                        alignContent: 'center',
                        display: 'flex',
                    }}>
                        <QRCode  value={`nostr:${nevent}`} />
                    </Box>
                </Box>
            </DialogContent>
        </>
    );
}

export default Invite;
