import React from 'react';
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
import {Channel} from 'types';
import QRCode from 'react-qr-code';
import { nip19 } from 'nostr-tools';


const Invite = (props: { channel: Channel }) => {
    const {channel} = props;
    const [, showModal] = useModal();
    const [t] = useTranslation();

    const handleClose = () => {
        showModal(null);
    };

    const eventID = channel.id;
    // Convert to bench 32 event id
    //

    const event = { id: eventID, kind: 40, relays: ['wss://nostream.breadslice.com', 'wss://relay.damus.io', 'wss://relay1.nostrchat.io'] };
    const nevent = nip19.neventEncode(event);
    const url = `${window.location.protocol}//${window.location.host}/channel/${nevent}`;

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

                    <p>{JSON.stringify(event)}</p>
                    <QRCode value={`nostr:${nevent}`} />
                </Box>
            </DialogContent>
        </>
    );
}

export default Invite;
